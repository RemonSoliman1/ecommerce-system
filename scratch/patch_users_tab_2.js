const fs = require('fs');
const file = 'app/[locale]/admin/components/AdminUsersTab.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import UserActivity")) {
    content = content.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport UserActivity from './UserActivity';"
    );
}

content = content.replace(
    "                                                            </div>\r\n                                                        </td>\r\n                                                    </tr>",
    "                                                            </div>\n<UserActivity userId={u.id} />\n                                                        </td>\n                                                    </tr>"
);

// If running on LF instead of CRLF
content = content.replace(
    "                                                            </div>\n                                                        </td>\n                                                    </tr>",
    "                                                            </div>\n<UserActivity userId={u.id} />\n                                                        </td>\n                                                    </tr>"
);

fs.writeFileSync(file, content);
console.log('Success');
