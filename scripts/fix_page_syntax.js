const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '        </div>\n      </div>\n    </div>\n  );\n}',
    '        </div>\n      </div>\n    </div>\n    </>\n  );\n}'
);

if (content.indexOf('</>') === -1) {
    // maybe CRLF
    content = content.replace(
        '        </div>\r\n      </div>\r\n    </div>\r\n  );\r\n}',
        '        </div>\r\n      </div>\r\n    </div>\r\n    </>\r\n  );\r\n}'
    );
}

fs.writeFileSync(file, content);
console.log('Fixed page.js syntax');
