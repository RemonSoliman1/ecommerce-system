const fs = require('fs');

const css = `
.quickAddBtn {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 30px);
    z-index: 20;
    background: linear-gradient(135deg, var(--color-accent) 0%, #f9e2aa 50%, var(--color-accent) 100%);
    background-size: 200% auto;
    color: #120c0a;
    border: none;
    padding: 10px 12px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(197, 163, 92, 0.4);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.quickAddBtn:hover {
    background-position: right center;
    box-shadow: 0 6px 20px rgba(197, 163, 92, 0.7), inset 0 0 10px rgba(255,255,255,0.6);
    transform: translateX(-50%) translateY(-2px);
}

.quickAddBtn:active {
    transform: translateX(-50%) translateY(1px);
    box-shadow: 0 2px 10px rgba(197, 163, 92, 0.4);
}

.quickAddBtn.outOfStock {
    background: #2a2a2a;
    color: #555;
    box-shadow: none;
    cursor: not-allowed;
}
.quickAddBtn.outOfStock:hover {
    background: #2a2a2a;
    box-shadow: none;
    transform: translateX(-50%);
}
`;

fs.appendFileSync('app/[locale]/globals.css', css);
console.log('Appended CSS to globals.css');
