const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ include: { brand: true } });
  let cubaCount = 0;
  products.forEach(p => {
    const origin = p.origin || p.brand?.origin || 'Unknown';
    if (origin.toLowerCase().includes('cuba')) cubaCount++;
    console.log(p.name + ' -> ' + origin);
  });
  console.log(`Total: ${products.length}, Cuba: ${cubaCount} (${(cubaCount/products.length*100).toFixed(1)}%)`);
}
main().finally(() => prisma.$disconnect());
