
import productsData from '@/data/products.json';

// Re-export constants for compatibility
export const PRODUCTS = productsData;

export const BRANDS = [
    {
        id: 'cohiba',
        name: 'Cohiba',
        type: 'cigar',
        origin: 'Cuba',
        description: 'The flagship brand of Habanos, created in 1966 for President Fidel Castro.',
        logo: '/images/brands/Cohiba_logo.svg' // Placeholder
    },
    {
        id: 'montecristo',
        name: 'Montecristo',
        type: 'cigar',
        origin: 'Cuba',
        description: 'The most famous and popular of all Havana brands.',
        logo: '/images/brands/Montecristo_cigar_logo.svg'
    },
    {
        id: 'arturo-fuente',
        name: 'Arturo Fuente',
        type: 'cigar',
        origin: 'Dominican Republic',
        description: 'A family tradition since 1912, known for the Opus X.',
        logo: '/images/brands/Arturo_Fuente_logo.svg'
    },
    {
        id: 'padron',
        name: 'Padrón',
        type: 'cigar',
        origin: 'Nicaragua',
        description: 'Delivering only the finest, handmade, complex cigars.',
        logo: '/images/brands/Padron-cigars-logo.svg'
    },
    {
        id: 'oliva',
        name: 'Oliva',
        type: 'cigar',
        origin: 'Nicaragua',
        description: 'A family of cigar makers that have been producing fine cigars since 1886.',
        logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/oliva.png')
    },
    {
        id: 'romeo-y-julieta',
        name: 'Romeo y Julieta',
        type: 'cigar',
        origin: 'Cuba',
        description: 'Famous for the romance of its name and choice of Winston Churchill.',
        logo: '/images/brands/Romeo_y_Julieta_cigar_logo.svg'
    },
    {
        id: 'davidoff',
        name: 'Davidoff',
        type: 'cigar',
        origin: 'Dominican Republic',
        description: 'Time beautifully filled.',
        logo: '/images/brands/Davidoff_logo.svg'
    },
    {
        id: 'std',
        name: 'S.T. Dupont',
        type: 'accessory',
        origin: 'France',
        description: 'Luxury lighters and cutters.',
        logo: '/images/brands/std.svg'
    },
    {
        id: 'xikar',
        name: 'Xikar',
        type: 'accessory',
        origin: 'USA',
        description: 'The best thing to happen to cigars since fire.',
        logo: '/images/brands/XIKAR_logo.svg'
    },
    {
        id: 'elie-bleu',
        name: 'Elie Bleu',
        type: 'accessory',
        origin: 'France',
        description: 'The finest humidors in the world.',
        logo: '/images/brands/eliebleu.svg'
    },
    {
        id: 'newair',
        name: 'NewAir',
        type: 'accessory',
        origin: 'USA',
        description: 'Modern cooling solutions.',
        logo: '/images/brands/newair.svg'
    },
    {
        id: 'audew',
        name: 'Audew',
        type: 'accessory',
        origin: 'China',
        description: 'Affordable precision cooling.',
        logo: '/images/brands/8126b856-11f4-411a-82ee-06b29f7902ba.svg'
    },
    {
        id: 'habanos',
        name: 'Habanos S.A.',
        type: 'cigar',
        origin: 'Cuba',
        description: 'The world leader in the commercialization of Premium cigars.',
        logo: '/images/brands/Cohiba_logo.svg' // Placeholder
    },
    {
        id: 'factory',
        name: 'Factory Bundles',
        type: 'cigar',
        origin: 'Nicaragua',
        description: 'Premium value bundles.',
        logo: '/images/brands/Padron-cigars-logo.svg' // Placeholder
    },
    { id: 'camacho', name: 'Camacho', type: 'cigar', origin: 'Honduras', description: 'Bold, everyday smokes known for Corojo tobacco.', logo: '/images/brands/Camacho_Cigars_logo.svg' },
    { id: 'rocky-patel', name: 'Rocky Patel', type: 'cigar', origin: 'Honduras/Nicaragua', description: 'Exceptional quality and consistency.', logo: '/images/brands/rocky-patel.svg' },
    { id: 'ashton', name: 'Ashton', type: 'cigar', origin: 'Dominican Republic', description: 'One of the world\'s premier luxury cigar brands.', logo: '/images/brands/Ashton_Cigars_logo.svg' },
    { id: 'cao', name: 'CAO', type: 'cigar', origin: 'Nicaragua', description: 'Innovative blends and unique wrapper leaves.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/cao.png') },
    { id: 'punch', name: 'Punch', type: 'cigar', origin: 'Honduras', description: 'A bold, historic brand with rich robust flavors.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/punch.png') },
    { id: 'gurkha-cigars', name: 'Gurkha', type: 'cigar', origin: 'Dominican Republic', description: 'Known as the "Rolls Royce of cigars".', logo: '/images/brands/gurkha.svg' },
    { id: 'san-cristobal', name: 'San Cristobal', type: 'cigar', origin: 'Nicaragua', description: 'Exquisite, full-bodied Nicaraguan artistry.', logo: '/images/brands/san-cristobal.svg' },
    { id: 'avo', name: 'AVO', type: 'cigar', origin: 'Dominican Republic', description: 'Symphonies of flavor orchestrated by Avo Uvezian.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/avo.png') },
    { id: 'padilla', name: 'Padilla', type: 'cigar', origin: 'Nicaragua', description: 'Boutique craftsmanship and rich traditions.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/padilla.png') },
    { id: 'h-upmann', name: 'H. Upmann', type: 'cigar', origin: 'Dominican Republic', description: 'Over 175 years of heritage and prestige.', logo: '/images/brands/H_Upmann_Logo.svg' },
    { id: 'alec-bradley', name: 'Alec Bradley', type: 'cigar', origin: 'Honduras', description: 'Award-winning blends tailored to true connoisseurs.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/alec-bradley.png') },
    { id: 'zino', name: 'Zino', type: 'cigar', origin: 'Nicaragua/Honduras', description: 'A contemporary, premium lifestyle cigar.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/zino.png') },
    { id: 'el-septimo', name: 'El Septimo', type: 'cigar', origin: 'Costa Rica', description: 'Ultra-premium, Swiss-designed luxury smoking.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/el-septimo.png') },
    { id: 'chateau-diadem', name: 'Chateau Diadem', type: 'cigar', origin: 'Dominican Republic', description: 'Elegant boutique blends offering rich complexity.', logo: '/images/brands/Chateau-Diadem-Logo.svg' },
    { id: 'e-p-carrillo', name: 'E.P. Carrillo', type: 'cigar', origin: 'Dominican Republic', description: 'Masterful blends by Ernesto Perez-Carrillo.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/ep-carrillo.png') },
    { id: 'factory-smokes', name: 'Factory Smokes', type: 'cigar', origin: 'Nicaragua', description: 'Premium value bundles by Drew Estate.', logo: '/images/brands/factory.svg' },
    { id: 'liga-privada', name: 'Liga Privada', type: 'cigar', origin: 'Nicaragua', description: 'Exclusive and highly sought-after blends.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/liga-privada.png') },
    { id: 'deadwood', name: 'Deadwood', type: 'cigar', origin: 'Nicaragua', description: 'Yummy bitches blended with aromatic tobaccos.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/deadwood.png') },
    { id: 'acid', name: 'ACID', type: 'cigar', origin: 'Nicaragua', description: 'The absolute best in infused smoking.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/acid.png') },
    { id: 'herrera-esteli', name: 'Herrera Esteli', type: 'cigar', origin: 'Nicaragua', description: 'Willy Herrera\'s masterful cubanesque blends.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/herrera-esteli.png') },
    { id: 'java', name: 'Java', type: 'cigar', origin: 'Nicaragua', description: 'The absolute finest coffee-infused cigars.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/java.png') },
    { id: 'tabak-especial', name: 'Tabak Especial', type: 'cigar', origin: 'Nicaragua', description: 'Rich, coffee-infused Nicaraguan masterpieces.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/java.png') },
    { id: 'isla-del-sol', name: 'Isla del Sol', type: 'cigar', origin: 'Nicaragua', description: 'Sweet, coffee-infused enjoyment.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/java.png') },
    { id: 'kentucky-fire-cured', name: 'Kentucky Fire Cured', type: 'cigar', origin: 'Nicaragua', description: 'Smoky, campfire notes from fire-cured tobacco.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/kentucky-fire-cured.png') },
    { id: 'pappy-van-winkle', name: 'Pappy Van Winkle', type: 'cigar', origin: 'Nicaragua', description: 'Rich barrel-fermented tradition.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/pappy-van-winkle.png') },
    { id: 'nica-rustica', name: 'Nica Rustica', type: 'cigar', origin: 'Nicaragua', description: 'Rustic, bold, and unapologetically Nicaraguan.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/nica-rustica.png') },
    { id: 'the-egg', name: 'The Egg', type: 'cigar', origin: 'Nicaragua', description: 'A whimsical and robust experience.', logo: '/images/brands/egg.svg' },
    { id: 'blackened', name: 'Blackened', type: 'cigar', origin: 'Nicaragua', description: 'A bold collaboration between Drew Estate and Metallica.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/blackened.png') },
    { id: '20-acre-farm', name: '20 Acre Farm', type: 'cigar', origin: 'Nicaragua', description: 'Complex Florida Sun Grown tobaccos.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/20-acre-farm.png') },
    { id: 'my-father', name: 'My Father', type: 'cigar', origin: 'Nicaragua', description: 'Rich, peppery excellence from the Garcia Family.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/my-father.png') },
    { id: 'la-aroma-de-cuba', name: 'La Aroma de Cuba', type: 'cigar', origin: 'Nicaragua', description: 'Historic Cuban brand reborn with modern acclaim.', logo: '/api/image-proxy?url=' + encodeURIComponent('https://www.cigarpage.com/media/wysiwyg/brand-logos/la-aroma-de-cuba.png') }
];

export const MOCK_USER_HISTORY = [
    'cohiba', 'full-strength', 'cuba'
];
