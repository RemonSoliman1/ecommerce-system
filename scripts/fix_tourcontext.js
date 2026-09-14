const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

// The original file ends with:
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </TourContext.Provider>
// 
// I need to add one more </div> before )} and remove the extra ones I added.

content = content.replace(
    /<\/button>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/TourContext\.Provider>/g,
    '</button>\n                    </div>\n                </div>\n            </div>\n            )}\n        </TourContext.Provider>'
);

fs.writeFileSync(file, content);
console.log('Fixed TourContext');
