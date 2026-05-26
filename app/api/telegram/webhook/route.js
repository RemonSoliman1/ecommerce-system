import { NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Constants & Env Vars
const token = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.ADMIN_CHAT_ID || '123456789'; // Ensure this is set in Vercel!
const WEB_APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';

if (!token) console.error('❌ TELEGRAM_BOT_TOKEN missing');

// 3. Initialize Telegraf Bot
const bot = new Telegraf(token || '');

// Database Helper
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

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
        return data || { telegram_id: telegramId, language: 'en', state: 'default', recent_actions: [], is_live_chat_active: false, mirror_system_logs: true, live_log_message_id: null };
    } catch {
        return { telegram_id: telegramId, language: 'en', state: 'default', recent_actions: [], is_live_chat_active: false, mirror_system_logs: true, live_log_message_id: null };
    }
}

async function logRecentAction(telegramId, actionText, userState = null) {
    if (!userState) {
        userState = await getUserState(telegramId);
    }
    const currentActions = Array.isArray(userState.recent_actions) ? userState.recent_actions : [];
    
    const now = new Date();
    // HH:MM:SS format based on server time (can be adjusted to local timezone if necessary)
    const timeString = now.toTimeString().split(' ')[0]; 
    const actionObj = { action: actionText, time: timeString };

    currentActions.unshift(actionObj);
    const slicedActions = currentActions.slice(0, 10); // Ghost Edit buffer size: 10
    
    await updateUserState(telegramId, { recent_actions: slicedActions });
    userState.recent_actions = slicedActions; // keep local state fresh
}

async function sendLoudMirror(user, message, prefix = '') {
    if (!user.thread_id) return false;
    try {
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, `${prefix}${message}`, {
            message_thread_id: user.thread_id,
            disable_notification: false
        });
        return true;
    } catch (e) {
        console.error("Failed to mirror loudly to admin:", e);
        const errStr = String(e.message || e.description || e).toLowerCase();
        if (errStr.includes('not found') || errStr.includes('closed') || errStr.includes('deleted') || errStr.includes('thread') || errStr.includes('topic')) {
            const topicName = user.store_customer_id 
                ? `${user.first_name || 'Aficionado'} (Store ID: ${user.store_customer_id})` 
                : `${user.first_name || 'Aficionado'} (ID: ${user.telegram_id})`;
            try {
                const newTopic = await bot.telegram.createForumTopic(ADMIN_CHAT_ID, topicName);
                user.thread_id = newTopic.message_thread_id;
                user.is_live_chat_active = false;
                user.live_log_message_id = null;
                
                await updateUserState(user.telegram_id, { 
                    thread_id: user.thread_id, 
                    live_log_message_id: null,
                    is_live_chat_active: false
                });
                
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, `${prefix}${message}`, {
                    message_thread_id: user.thread_id,
                    disable_notification: false
                });
                return true;
            } catch (err) {
                console.error("Failed to recreate topic in sendLoudMirror:", err);
            }
        }
        return false;
    }
}

async function updateGhostLog(user) {
    if (!user.thread_id) return;
    if (user.mirror_system_logs === false) return; // Completely muted by admin

    const actionsText = (user.recent_actions || []).map(a => `[${a.time}] ${escapeHTML(a.action)}`).join('\n');
    const logBlockText = `🖥️ <b>Live Bot Activity:</b>\n\n${actionsText}`;

    const sendFreshLog = async (threadId) => {
        const sentMsg = await bot.telegram.sendMessage(ADMIN_CHAT_ID, logBlockText, {
            message_thread_id: threadId,
            parse_mode: 'HTML',
            disable_notification: true
        });
        user.live_log_message_id = sentMsg.message_id;
        await updateUserState(user.telegram_id, { live_log_message_id: sentMsg.message_id });
    };

    try {
        if (!user.live_log_message_id) {
            await sendFreshLog(user.thread_id);
        } else {
            // Update existing log block
            await bot.telegram.editMessageText(
                ADMIN_CHAT_ID,
                user.live_log_message_id,
                null,
                logBlockText,
                { parse_mode: 'HTML' }
            );
        }
    } catch (e) {
        console.error("Failed to ghost edit log block:", e);
        const errStr = String(e.message || e.description || e).toLowerCase();
        if (errStr.includes('not found') || errStr.includes('closed') || errStr.includes('deleted') || errStr.includes('thread') || errStr.includes('topic')) {
            const topicName = user.store_customer_id 
                ? `${user.first_name || 'Aficionado'} (Store ID: ${user.store_customer_id})` 
                : `${user.first_name || 'Aficionado'} (ID: ${user.telegram_id})`;
            try {
                const newTopic = await bot.telegram.createForumTopic(ADMIN_CHAT_ID, topicName);
                user.thread_id = newTopic.message_thread_id;
                user.live_log_message_id = null;
                user.is_live_chat_active = false;
                
                await updateUserState(user.telegram_id, { 
                    thread_id: user.thread_id, 
                    live_log_message_id: null,
                    is_live_chat_active: false
                });
                
                await sendFreshLog(user.thread_id);
            } catch (err) {
                console.error("Failed to recreate topic for ghost log:", err);
            }
        }
    }
}

async function botReply(ctx, user, text, extra = {}, actionDescription = 'Sent message') {
    try {
        await ctx.reply(text, extra);
    } catch (e) {
        console.error("botReply failed with HTML/Markup, falling back to safe text:", e);
        try {
            const safeExtra = { ...extra };
            delete safeExtra.parse_mode;
            await ctx.reply(text.replace(/<[^>]*>?/gm, ''), safeExtra);
        } catch (e2) {
            console.error("botReply ultimate fallback failed:", e2);
            try {
                await ctx.reply(text.replace(/<[^>]*>?/gm, ''));
            } catch (e3) {}
        }
    }
    if (user && user.is_live_chat_active === false) {
        await logRecentAction(ctx.from.id, `🤖 ${actionDescription}`, user);
        await updateGhostLog(user);
    }
}

async function triggerHandoff(ctx, user, triggerContext) {
    try {
        await logRecentAction(ctx.from.id, `🚨 Requested Support (${triggerContext})`, user);
        
        // Dossier Generation
        let ordersCount = 0;
        let customerNameDisplay = `${user.first_name || 'Unknown'} (Unlinked)`;
        let phoneDisplay = "Not Linked";

        if (user.store_customer_id) {
            const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('customer_id', user.store_customer_id);
            ordersCount = count || 0;

            const { data: realCustomer } = await supabase.from('customers').select('name, phone').eq('id', user.store_customer_id).single();
            if (realCustomer) {
                customerNameDisplay = `${realCustomer.name} (Linked)`;
                phoneDisplay = realCustomer.phone || "No Phone";
            }
        }
        
        let actionsText = Array.isArray(user.recent_actions) && user.recent_actions.length > 0 
            ? user.recent_actions.map(a => `• [${a.time}] ${a.action}`).join('\n') 
            : '• None';

        const cheatSheet = `\n\n🛠️ <b>Admin Commands:</b>\n<code>/end</code> - Close live chat\n<code>/rename [name]</code> - Rename this topic\n<code>/toggle_logs</code> - Toggle ghost logs`;

        const dossierText = `📋 <b>Context Dossier</b>\n\n<b>Customer:</b> ${customerNameDisplay}\n<b>Phone:</b> ${phoneDisplay}\n<b>Total Orders:</b> ${ordersCount}\n\n<b>Recent Actions:</b>\n${actionsText}${cheatSheet}`;

        const sendDossier = async (threadId) => {
            try {
                const msg = await bot.telegram.sendMessage(ADMIN_CHAT_ID, dossierText, {
                    message_thread_id: threadId,
                    parse_mode: 'HTML',
                    disable_notification: true
                });
                await bot.telegram.pinChatMessage(ADMIN_CHAT_ID, msg.message_id, {
                    disable_notification: true
                });
                return msg;
            } catch (e) {
                console.error("Failed to send/pin dossier:", e);
                const errStr = String(e.message || e.description || e).toLowerCase();
                if (errStr.includes('not found') || errStr.includes('closed') || errStr.includes('deleted') || errStr.includes('thread') || errStr.includes('topic')) {
                    return null;
                }
                throw e;
            }
        };

        let activeThreadId = user.thread_id;
        let dossierMsg;

        if (activeThreadId) {
            dossierMsg = await sendDossier(activeThreadId);
            if (!dossierMsg) activeThreadId = null; // Thread was dead, force recreation
        }

        if (!activeThreadId) {
            const topicName = user.store_customer_id 
                ? `${ctx.from.first_name || 'Aficionado'} (Store ID: ${user.store_customer_id})` 
                : `${ctx.from.first_name || 'Aficionado'} (ID: ${ctx.from.id})`;

            const newTopic = await bot.telegram.createForumTopic(ADMIN_CHAT_ID, topicName);
            activeThreadId = newTopic.message_thread_id;
            dossierMsg = await sendDossier(activeThreadId);
        }

        await updateUserState(ctx.from.id, { state: 'live_chat', is_live_chat_active: true, thread_id: activeThreadId });
        user.is_live_chat_active = true;
        user.thread_id = activeThreadId;
        
        const loudSuccess = await sendLoudMirror(user, "The customer is waiting for an agent.", "🚨 [SUPPORT REQUESTED] ");
        if (!loudSuccess) {
            throw new Error("sendLoudMirror failed to deliver the alert.");
        }

        const t = strings[user.language] || strings['en'];
        await ctx.reply(t.chatConnected);

    } catch (error) {
        console.error('HANDOFF ERROR:', error);
        console.error(`DEBUG: ADMIN_CHAT_ID currently loaded is: "${ADMIN_CHAT_ID}"`);
        await ctx.reply("Sorry, our support desk is currently unavailable. Please try again in a few minutes.");
    }
}

const strings = {
    en: {
        welcome: (name) => `<b>Welcome to the Lounge, ${name}. 🥃</b>\n\n• Click 'Enter the Humidor' below to browse our full collection.\n• Type a brand name (e.g., 'Oliva' or 'Davidoff') to instantly search our stock.\n• Type /chat to speak directly with our support team.`,
        chatConnected: "You are now connected to a live agent. How can we assist you today?",
        searchResult: (query) => `🔎 I found some vitolas matching "<b>${escapeHTML(query)}</b>". Click below to view them.`,
        btnLounge: "🔥 Enter the Humidor",
        btnSearch: (q) => `🔎 View "${q}"`,
        btnLinkAccount: "🔗 Link Store Account",
        reqContactPrompt: "Please click the button below to natively link your Lounge store profile with this Telegram bot using your phone number:",
        btnShareContact: "📱 Share Contact to Verify",
        successLinked: "Your Lounge account has been successfully verified & linked! 🥃"
    },
    ar: {
        welcome: (name) => `<b>مرحباً بك في اللاونج، ${escapeHTML(name)}. 🥃</b>\n\n• اضغط على 'دخول اللاونج' بالأسفل لتصفح مجموعتنا الكاملة.\n• اكتب اسم الماركة (مثل 'Oliva' أو 'Davidoff') للبحث الفوري في مخزوننا.\n• اكتب /chat للتحدث مباشرة مع فريق الدعم.`,
        chatConnected: "أنت الآن متصل بأحد وكلائنا المباشرين. كيف يمكننا مساعدتك اليوم؟",
        searchResult: (query) => `🔎 لقد وجدت بعض الأنواع التي تطابق "<b>${escapeHTML(query)}</b>". اضغط بالأسفل لرؤيتها.`,
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
    const user = await getUserState(ctx.from.id);
    await logRecentAction(ctx.from.id, "👤 Started the bot", user);
    
    // Topic Creation if missing
    if (!user.thread_id) {
        const topicName = `${ctx.from.first_name || 'Aficionado'} (ID: ${ctx.from.id})`;
        try {
            const newTopic = await bot.telegram.createForumTopic(ADMIN_CHAT_ID, topicName);
            user.thread_id = newTopic.message_thread_id;
            await updateUserState(ctx.from.id, { thread_id: user.thread_id });
        } catch(e) {}
    }

    const defaultMsg = "Please choose your preferred language:\nيُرجى اختيار لغتك المفضلة:";
    await botReply(ctx, user, defaultMsg, Markup.inlineKeyboard([
        Markup.button.callback('English 🇬🇧', 'lang_en'),
        Markup.button.callback('عربي 🇪🇬', 'lang_ar')
    ]), "Sent Language Prompt");
});

// Language Select Actions
bot.action(['lang_en', 'lang_ar'], async (ctx) => {
    const lang = ctx.match[0] === 'lang_en' ? 'en' : 'ar';
    const name = ctx.from?.first_name || 'Aficionado';

    const user = await getUserState(ctx.from.id);
    await logRecentAction(ctx.from.id, `👤 Selected Language: ${lang}`, user);

    // Persist to DB
    await updateUserState(ctx.from.id, { 
        username: ctx.from.username, 
        first_name: name,
        language: lang,
        state: 'default' 
    });

    const updatedUser = { ...user, language: lang };

    // Send Welcome Instructions
    const t = strings[lang];
    await botReply(ctx, updatedUser, t.welcome(name), {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.webApp(t.btnLounge, WEB_APP_URL)],
            [Markup.button.callback(t.btnLinkAccount, 'req_link')]
        ])
    }, "Sent Welcome Menu");

    await ctx.answerCbQuery(); // Acknowledge button press
});

// Action to Trigger Contact Parsing Keyboard
bot.action('req_link', async (ctx) => {
    const user = await getUserState(ctx.from.id);
    await logRecentAction(ctx.from.id, "👤 Clicked: Link Account", user);
    
    const t = strings[user.language] || strings['en'];
    await botReply(ctx, user, t.reqContactPrompt, Markup.keyboard([
        Markup.button.contactRequest(t.btnShareContact)
    ]).resize().oneTime(), "Sent Contact Request Prompt");
    
    await ctx.answerCbQuery();
});

// Primary Contact Receiver (The Fuzzy Match & Link Processor)
bot.on('contact', async (ctx) => {
    const user = await getUserState(ctx.from.id);
    await logRecentAction(ctx.from.id, "👤 Shared Contact Info", user);
    
    const t = strings[user.language] || strings['en'];
    const contact = ctx.message.contact;

    // Reject fake / forwarded contacts natively 
    if (contact.user_id && contact.user_id !== ctx.from.id) {
        return botReply(ctx, user, "❌ Invalid Contact Match.", Markup.removeKeyboard(), "Sent Invalid Contact Error");
    }

    const rawNum = contact.phone_number || '';
    const pureNum = rawNum.replace(/\D/g, '');
    const anchorNum = pureNum.length >= 10 ? pureNum.slice(-10) : pureNum;

    const { data: matched } = await supabase.from('customers').select('id, name').ilike('phone', `%${anchorNum}`).limit(1);

    let finalStoreId = null;
    let fallbackName = contact.first_name + (contact.last_name ? ` ${contact.last_name}` : '');
    let finalAuthName = contact.first_name || 'Aficionado';

    if (matched && matched.length > 0) {
        finalStoreId = matched[0].id;
        if (matched[0].name) {
            finalAuthName = matched[0].name.split(' ')[0] || contact.first_name;
        }
    } else {
        const dummyEmail = `tg_${pureNum}@cigarlounge.local`;
        const { data: newCustomer, error } = await supabase.from('customers').insert([{
            name: fallbackName,
            email: dummyEmail,
            phone: rawNum
        }]).select('id').single();

        if (!error && newCustomer) finalStoreId = newCustomer.id;
    }

    if (finalStoreId) {
        await updateUserState(ctx.from.id, {
            store_customer_id: finalStoreId,
            phone_number: rawNum,
            first_name: finalAuthName
        });

        // Automatically rename the topic now that we have a Store ID
        if (user.thread_id) {
            try {
                const newTopicName = `${finalAuthName} (Store ID: ${finalStoreId})`;
                await bot.telegram.editForumTopic(ADMIN_CHAT_ID, user.thread_id, { name: newTopicName });
            } catch (e) {
                console.error("Failed to retroactively rename topic:", e);
            }
        }

        await botReply(ctx, user, t.successLinked, Markup.removeKeyboard(), "Sent Link Success");
    } else {
        await botReply(ctx, user, "❌ Error binding Telegram Profile.", Markup.removeKeyboard(), "Sent Link Error");
    }
});

// /chat command (Toggle Live Chat explicitly)
bot.command('chat', async (ctx) => {
    const user = await getUserState(ctx.from.id);
    await triggerHandoff(ctx, user, "/chat command");
});

// Message Traffic Cop Router
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const chatId = ctx.message.chat.id.toString();

    // 1. The Admin Command Interceptor (Highest Priority)
    if (chatId === ADMIN_CHAT_ID) {
        const threadId = ctx.message.message_thread_id;
        if (!threadId) return;

        if (text && text.startsWith('/')) {
            // Extract command correctly without bot username
            const commandParts = text.split(' ');
            let command = commandParts[0];
            if (command.includes('@')) {
                command = command.split('@')[0];
            }

            try {
                const { data: customer } = await supabase
                    .from('telegram_users')
                    .select('*')
                    .eq('thread_id', threadId)
                    .single();

                if (customer && customer.telegram_id) {
                    if (command === '/end-chat' || command === '/end' || command === '/close_chat') {
                        await updateUserState(customer.telegram_id, { is_live_chat_active: false, live_log_message_id: null });
                        await bot.telegram.sendMessage(ctx.message.chat.id, `✅ Chat ended. Customer returned to bot mode.`, {
                            message_thread_id: threadId
                        });
                        return;
                    }

                    if (command === '/rename') {
                        const newName = text.replace(commandParts[0], '').trim();
                        if (newName) {
                            try {
                                await bot.telegram.editForumTopic(ctx.message.chat.id, threadId, { name: newName });
                                await bot.telegram.sendMessage(ctx.message.chat.id, `✅ Topic renamed to: ${newName}`, { message_thread_id: threadId });
                            } catch (e) {
                                await bot.telegram.sendMessage(ctx.message.chat.id, `❌ Failed to rename topic. Please ensure the bot is set as an Administrator with 'Manage Topics' permissions in the group settings.`, { message_thread_id: threadId });
                            }
                        }
                        return;
                    }

                    if (command === '/toggle_logs') {
                        const newMirrorState = !customer.mirror_system_logs;
                        await updateUserState(customer.telegram_id, { mirror_system_logs: newMirrorState });
                        await bot.telegram.sendMessage(ctx.message.chat.id, `System logs mirroring is now ${newMirrorState ? 'ON' : 'OFF'}.`, {
                            message_thread_id: threadId
                        });
                        return;
                    }

                    if (command === '/admin_help') {
                        const helpText = `🛠️ Admin Command Cheat Sheet\n/end-chat (or /end) - Closes the live chat and returns the customer to bot mode.\n/rename [name] - Changes the name of this specific topic.\n/toggle_logs - Pauses or resumes the silent bot activity logs for this user.\n/admin_help - Generates this pinned cheat sheet.`;
                        try {
                            const msg = await bot.telegram.sendMessage(ctx.message.chat.id, helpText, { message_thread_id: threadId });
                            await bot.telegram.pinChatMessage(ctx.message.chat.id, msg.message_id, { disable_notification: true });
                        } catch (e) {
                            console.error('Failed to send or pin admin_help:', e.message);
                        }
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to fetch customer for admin command:", e);
            }
            
            // Explicitly return after ANY command to stop execution
            return;
        }

        // Customer message relaying (Admin to Customer)
        try {
            const { data: customer } = await supabase
                .from('telegram_users')
                .select('*')
                .eq('thread_id', threadId)
                .single();

            if (customer && customer.telegram_id) {
                await bot.telegram.sendMessage(customer.telegram_id, text);
            }
        } catch (e) {
            console.error("Failed to route Admin reply back through Forum parameter:", e);
        }
        return;
    }

    if (text && text.startsWith('/')) return;

    // 2. Customer to Admin (The Tracking Relay)
    const user = await getUserState(ctx.from.id);
    
    // Topic Creation if missing
    let activeThreadId = user.thread_id;
    if (!activeThreadId) {
        const topicName = user.store_customer_id 
            ? `${ctx.from.first_name || 'Aficionado'} (Store ID: ${user.store_customer_id})` 
            : `${ctx.from.first_name || 'Aficionado'} (ID: ${ctx.from.id})`;
        try {
            const newTopic = await bot.telegram.createForumTopic(ADMIN_CHAT_ID, topicName);
            activeThreadId = newTopic.message_thread_id;
            await updateUserState(ctx.from.id, { thread_id: activeThreadId });
            user.thread_id = activeThreadId;
        } catch(e) {}
    }

    // Smart Keyword Router
    const supportKeywords = /chat|live|agent|human|customer service|assistance|help|مساعدة|خدمة العملاء|تحدث مع|بشري|وكيل|دعم|شات|محادثة/i;
    
    if (supportKeywords.test(text) && !user.is_live_chat_active) {
        await triggerHandoff(ctx, user, `Smart Keyword: "${text}"`);
        return;
    }

    await logRecentAction(ctx.from.id, `👤 Said: "${text}"`, user);

    if (user.is_live_chat_active) {
        const sent = await sendLoudMirror(user, text, "🔴 [LIVE CHAT]: ");
        if (sent) return;
        // If sent is false, the thread was deleted. Fall through to normal bot logic!
    } else {
        await updateGhostLog(user);
    }

    // 3. Fallback Web App Search
    const safeTextForUrl = text.length > 100 ? text.substring(0, 100) : text;
    const searchUrl = `${WEB_APP_URL}/shop?q=${encodeURIComponent(safeTextForUrl)}`;
    const t = strings[user.language] || strings['en'];

    const rawBtnText = t.btnSearch(text);
    const safeBtnText = rawBtnText.length > 60 ? rawBtnText.substring(0, 57) + '...' : rawBtnText;

    await botReply(ctx, user, t.searchResult(text), {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.webApp(safeBtnText, searchUrl)],
            [Markup.button.webApp(t.btnLounge, WEB_APP_URL)]
        ])
    }, `Sent Search Results for "${safeTextForUrl}"`);
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
