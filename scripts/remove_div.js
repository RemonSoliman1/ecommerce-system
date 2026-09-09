const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace("                </div>\n            </div>\n            </div>\n        </Link>", "                </div>\n            </div>\n        </Link>");
    content = content.replace("                </div>\r\n            </div>\r\n            </div>\r\n        </Link>", "                </div>\r\n            </div>\r\n        </Link>");
    fs.writeFileSync(file, content);
}

fixFile('components/ui/ProductCard.js');
fixFile('app/[locale]/shop/page.js');
console.log('Fixed extra divs!');
