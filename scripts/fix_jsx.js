const fs = require('fs');
let content = fs.readFileSync('app/[locale]/shop/page.js', 'utf8');

let match = content.match(/function ShopProductCard\([\s\S]*?\}\s*export default function ShopPage/);
if (match) {
    let body = match[0];
    let fixed = body.replace(
        "                )}\r\n            </div>\r\n        </Link>",
        "                )}\r\n            </div>\r\n            </div>\r\n        </Link>"
    ).replace(
        "                )}\n            </div>\n        </Link>",
        "                )}\n            </div>\n            </div>\n        </Link>"
    );
    content = content.replace(body, fixed);
    fs.writeFileSync('app/[locale]/shop/page.js', content);
    console.log("Fixed missing div in ShopProductCard!");
}

content = fs.readFileSync('components/ui/ProductCard.js', 'utf8');
let fixedCard = content.replace(
    "                    )}\r\n                </div>\r\n            </div>\r\n        </Link>",
    "                    )}\r\n                </div>\r\n            </div>\r\n            </div>\r\n        </Link>"
).replace(
    "                    )}\n                </div>\n            </div>\n        </Link>",
    "                    )}\n                </div>\n            </div>\n            </div>\n        </Link>"
);
fs.writeFileSync('components/ui/ProductCard.js', fixedCard);
console.log("Fixed missing div in ProductCard.js!");
