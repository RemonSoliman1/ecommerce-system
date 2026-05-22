import { NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Constants & Env Vars
const token = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '123456789'; // Ensure this is set in Vercel!
const WEB_APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';

if (!token) console.error('❌ TELEGRAM_BOT_TOKEN missing');

// 3. Initialize Telegraf Bot
const bot = new Telegraf(token || '');

// Database Helper
async function updateUserState(telegramId, data) {
    try {
        await supabase.from('telegram_users').upsert({ telegram_id: telegramId, ...data }, { onConflict: 'telegram_id' });
    } catch (e) {
        console.error("DB Error updating user state:", e);
    }
}

async function getUserState(telegramId) {
    try {
        const { data } = await supabase.from('telegram_users').select('*').eq('telegram_id', telegramId).single();
        return data || { language: 'en', state: 'default' };
    } catch {
        return { language: 'en', state: 'default' };
    }
}

const strings = {
    en: {
        welcome: (name) => `<b>Welcome to the Lounge, ${name}. 🥃</b>\n\n• Click 'Enter the Humidor' below to browse our full collection.\n• Type a brand name (e.g., 'Oliva' or 'Davidoff') to instantly search our stock.\n• Type /chat to speak directly with our support team.`,
        chatConnected: "You are now connected to a live agent. How can we assist you today?",
        searchResult: (query) => `🔎 I found some vitolas matching "<b>${query}</b>". Click below to view them.`,
        btnLounge: "🔥 Enter the Humidor",
        btnSearch: (q) => `🔎 View "${q}"`,
        btnLinkAccount: "🔗 Link Store Account",
        reqContactPrompt: "Please click the button below to natively link your Lounge store profile with this Telegram bot using your phone number:",
        btnShareContact: "📱 Share Contact to Verify",
        successLinked: "Your Lounge account has been successfully verified & linked! 🥃"
    },
    ar: {
        welcome: (name) => `<b>مرحباً بك في اللاونج، ${name}. 🥃</b>\n\n• اضغط على 'دخول اللاونج' بالأسفل لتصفح مجموعتنا الكاملة.\n• اكتب اسم الماركة (مثل 'Oliva' أو 'Davidoff') للبحث الفوري في مخزوننا.\n• اكتب /chat للتحدث مباشرة مع فريق الدعم.`,
        chatConnected: "أنت الآن متصل بأحد وكلائنا المباشرين. كيف يمكننا مساعدتك اليوم؟",
        searchResult: (query) => `🔎 لقد وجدت بعض الأنواع التي تطابق "<b>${query}</b>". اضغط بالأسفل لرؤيتها.`,
        btnLounge: "🔥 دخول اللاونج",
        btnSearch: (q) => `🔎 عرض "${q}"`,
        btnLinkAccount: "🔗 ربط حساب المتجر",
        reqContactPrompt: "يرجى الضغط على الزر أدناه لربط ملف تعريف متجر اللاونج الخاص بك باستخدام رقم الهاتف:",
        btnShareContact: "📱 مشاركة جهة الاتصال للتحقق",
        successLinked: "تم ربط حساب اللاونج الخاص بك وتوثيقه بنجاح! 🥃"
    }
};

// --- HANDLERS ---

// /start command (Language Selection)
bot.start(async (ctx) => {
    const defaultMsg = "Please choose your preferred language:\nيُرجى اختيار لغتك المفضلة:";
    await ctx.reply(defaultMsg, Markup.inlineKeyboard([
        Markup.button.callback('English 🇬🇧', 'lang_en'),
        Markup.button.callback('عربي 🇪🇬', 'lang_ar')
    ]));
});

// Language Select Actions
bot.action(['lang_en', 'lang_ar'], async (ctx) => {
    const lang = ctx.match[0] === 'lang_en' ? 'en' : 'ar';
    const name = ctx.from?.first_name || 'Aficionado';

    // Persist to DB
    await updateUserState(ctx.from.id, { 
        username: ctx.from.username, 
        first_name: name,
        language: lang,
        state: 'default' 
    });

    // Send Welcome Instructions
    const t = strings[lang];
    await ctx.reply(t.welcome(name), {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.webApp(t.btnLounge, WEB_APP_URL)],
            [Markup.button.callback(t.btnLinkAccount, 'req_link')]
        ])
    });

    await ctx.answerCbQuery(); // Acknowledge button press
});

// Action to Trigger Contact Parsing Keyboard
bot.action('req_link', async (ctx) => {
    const user = await getUserState(ctx.from.id);
    const t = strings[user.language] || strings['en'];
    
    // We strictly use ReplyKeyboardMarkup here as requested natively
    await ctx.reply(t.reqContactPrompt, Markup.keyboard([
        Markup.button.contactRequest(t.btnShareContact)
    ]).resize().oneTime());
    
    await ctx.answerCbQuery();
});

// Primary Contact Receiver (The Fuzzy Match & Link Processor)
bot.on('contact', async (ctx) => {
    const user = await getUserState(ctx.from.id);
    const t = strings[user.language] || strings['en'];
    const contact = ctx.message.contact;

    // Reject fake / forwarded contacts natively 
    if (contact.user_id && contact.user_id !== ctx.from.id) {
        return ctx.reply("❌ Invalid Contact Match.", Markup.removeKeyboard());
    }

    const rawNum = contact.phone_number || '';
    // Strip everything natively down to raw integers purely 
    const pureNum = rawNum.replace(/\D/g, '');
    
    // Egyptian Bulletproof Fuzzy Matching (Anchor strictly upon the final 10 digits universally overriding country prefixes +20/0)
    const anchorNum = pureNum.length >= 10 ? pureNum.slice(-10) : pureNum;

    // Strict wildcard at the front `%` guarantees the trailing numbers safely match the unified anchor exactly without corrupting middle integers!
    const { data: matched } = await supabase.from('customers').select('id, name').ilike('phone', `%${anchorNum}`).limit(1);

    let finalStoreId = null;
    let fallbackName = contact.first_name + (contact.last_name ? ` ${contact.last_name}` : '');
    let finalAuthName = contact.first_name || 'Aficionado';

    if (matched && matched.length > 0) {
        // Exists already natively in eCommerce Database Engine
        finalStoreId = matched[0].id;
        
        // Priority Fix constraint: Never let Telegram App contact names silently overwrite their literal E-Commerce profile name!
        if (matched[0].name) {
            finalAuthName = matched[0].name.split(' ')[0] || contact.first_name; // Extracts authentic Store naming securely!
        }
    } else {
        // Create headless eCommerce Profile bridging placeholder directly
        const dummyEmail = `tg_${pureNum}@cigarlounge.local`;
        
        const { data: newCustomer, error } = await supabase.from('customers').insert([{
            name: fallbackName,
            email: dummyEmail,
            phone: rawNum
        }]).select('id').single();

        if (!error && newCustomer) finalStoreId = newCustomer.id;
    }

    // Embed securely back inside Telegram Users structural parameters
    if (finalStoreId) {
        await updateUserState(ctx.from.id, {
            store_customer_id: finalStoreId,
            phone_number: rawNum,
            first_name: finalAuthName // Formally overwrite their App Contact label cleanly!
        });
        
        await ctx.reply(t.successLinked, Markup.removeKeyboard());
    } else {
        await ctx.reply("❌ Error binding Telegram Profile.", Markup.removeKeyboard());
    }
});

// /chat command (Toggle Live Chat)
bot.command('chat', async (ctx) => {
    const user = await getUserState(ctx.from.id);
    await updateUserState(ctx.from.id, { state: 'live_chat' });
    
    const t = strings[user.language] || strings['en'];
    await ctx.reply(t.chatConnected);
});

// Message Traffic Cop Router
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const chatId = ctx.message.chat.id.toString();

    // 1. Admin to Customer (The Reply logic via Forum Topics)
    // Telegram natively embeds `message_thread_id` on any message typed inside a Topic container.
    if (chatId === ADMIN_CHAT_ID) {
        const threadId = ctx.message.message_thread_id;
        if (!threadId) return; // If the admin types in the generic main channel, ignore.

        // Isolate which customer explicitly fundamentally owns this specific forum thread pipeline.
        try {
            const { data: customer } = await supabase
                .from('telegram_users')
                .select('telegram_id')
                .eq('thread_id', threadId)
                .single();

            if (customer && customer.telegram_id) {
                // Forward the exact Admin dialogue explicitly to the native customer DM container.
                await bot.telegram.sendMessage(customer.telegram_id, text);
            }
        } catch (e) {
            console.error("Failed to route Admin reply back through Forum parameter:", e);
        }
        return; // Always terminate instantly to restrict recursive loops.
    }

    // Ensure we aggressively nullify default system slash-commands
    if (text.startsWith('/')) return;

    // 2. Customer to Admin (The Tracking Relay)
    const user = await getUserState(ctx.from.id);
    const triggerWords = ['help', 'مساعدة', 'question', 'سؤال'];
    
    // Automatically flag routing if explicitly connected or word-triggered constraint matches
    const isTriggerWord = triggerWords.some(word => text.toLowerCase().includes(word));
    const isLiveChat = user.state === 'live_chat';

    if (isLiveChat || isTriggerWord) {
        try {
            let activeThreadId = user.thread_id;

            // Step A: Topic Generation. (If the customer has no assigned historical thread block yet).
            if (!activeThreadId) {
                // If we successfully locked an ID during Contact bridging, we prioritize formatting native Ecommerce Store ID over internal Telegram IDs entirely.
                const topicName = user.store_customer_id 
                    ? `${ctx.from.first_name || 'Aficionado'} (Store ID: ${user.store_customer_id})` 
                    : `${ctx.from.first_name || 'Aficionado'} (ID: ${ctx.from.id})`;

                const newTopic = await bot.telegram.createForumTopic(ADMIN_CHAT_ID, topicName);
                activeThreadId = newTopic.message_thread_id;

                // Sync immediately natively up to Supabase to memorize the mapping.
                await updateUserState(ctx.from.id, { thread_id: activeThreadId, state: 'live_chat' });
            } else if (!isLiveChat) {
                // Auto-transition them formally securely into Live Chat parameters.
                await updateUserState(ctx.from.id, { state: 'live_chat' });
            }

            // Step B: Native Injection Forwarding 
            // We use standard forward mechanics isolated down directly into their specific `activeThreadId` layer!
            await bot.telegram.forwardMessage(
                ADMIN_CHAT_ID, 
                ctx.chat.id, 
                ctx.message.message_id, 
                { message_thread_id: activeThreadId }
            );
            
        } catch (e) {
            console.error("Failed to route customer message into Forums. Is Topics enabled internally?", e);
        }
        return;
    }

    // 3. Fallback Web App Search
    const searchUrl = `${WEB_APP_URL}/shop?q=${encodeURIComponent(text)}`;
    const t = strings[user.language] || strings['en'];

    await ctx.reply(t.searchResult(text), {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.webApp(t.btnSearch(text), searchUrl)],
            [Markup.button.webApp(t.btnLounge, WEB_APP_URL)]
        ])
    });
});

// Generic Catch
bot.catch((err, ctx) => {
    console.error(`Error processing webhook update for ${ctx.updateType}`, err);
});

// Edge Execution Wrappers
export async function POST(req) {
    if (!token) return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    try {
        const body = await req.json();
        await bot.handleUpdate(body);
        return NextResponse.json({ success: true, processed: true });
    } catch (e) {
        console.error('Webhook Error:', e);
        return NextResponse.json({ error: 'Failed to process update', details: e.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Telegram Bot Webhook is Active and Listening.' });
}
