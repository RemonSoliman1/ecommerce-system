const fs = require('fs');
const file = 'app/[locale]/admin/components/AdminUsersTab.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport UserActivity from './UserActivity';"
);

// We want to inject it below the grid of 3 columns
content = content.replace(
    "</div>\n                                                        </td>\n                                                    </tr>",
    "</div>\n<UserActivity userId={u.id} />\n                                                        </td>\n                                                    </tr>"
);

fs.writeFileSync(file, content);
console.log('Success');
