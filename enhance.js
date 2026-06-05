const fs = require('fs');
const path = require('path');

const files = ['index.html', 'collections.html', 'inquiry.html', 'story.html'];

const cssToInject = `
    /* Custom Cursor Styles */
    .cursor-dot, .cursor-outline {
        position: fixed;
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
    }
    .cursor-dot {
        width: 8px;
        height: 8px;
        background-color: #FFBF00;
    }
    .cursor-outline {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 191, 0, 0.5);
        transition: width 0.2s, height 0.2s, background-color 0.2s;
    }
    .cursor-outline.hover {
        width: 60px;
        height: 60px;
        background-color: rgba(255, 191, 0, 0.1);
        border-color: transparent;
    }
    @media (pointer: coarse) {
        .cursor-dot, .cursor-outline {
            display: none;
        }
    }
`;

const htmlToInject = `
<!-- Custom Cursor -->
<div class="cursor-dot" id="cursor-dot"></div>
<div class="cursor-outline" id="cursor-outline"></div>
`;

const jsToInject = `
    <!-- Vanilla Tilt & Cursor JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js"></script>
    <script>
        // Custom Cursor Logic
        const cursorDot = document.getElementById('cursor-dot');
        const cursorOutline = document.getElementById('cursor-outline');
        
        if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
            window.addEventListener('mousemove', (e) => {
                const posX = e.clientX;
                const posY = e.clientY;
                
                cursorDot.style.left = \`\${posX}px\`;
                cursorDot.style.top = \`\${posY}px\`;
                
                // Slight delay for the outline using animate
                cursorOutline.animate({
                    left: \`\${posX}px\`,
                    top: \`\${posY}px\`
                }, { duration: 500, fill: "forwards" });
            });

            // Hover effects on interactive elements
            const interactables = document.querySelectorAll('a, button, input, select, textarea');
            interactables.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorOutline.classList.add('hover');
                });
                el.addEventListener('mouseleave', () => {
                    cursorOutline.classList.remove('hover');
                });
            });
        }

        // Initialize Vanilla Tilt on image cards/groups
        document.addEventListener('DOMContentLoaded', () => {
            const tiltElements = document.querySelectorAll('.group, .aspect-square, .aspect-\\\\[4\\\\/5\\\\], .aspect-\\\\[3\\\\/4\\\\]');
            if(typeof VanillaTilt !== 'undefined') {
                VanillaTilt.init(tiltElements, {
                    max: 3,
                    speed: 400,
                    glare: true,
                    "max-glare": 0.15,
                    scale: 1.02
                });
            }
            
            // Basic magnetic button effect for main CTAs
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                if(!btn.classList.contains('material-symbols-outlined')){
                    btn.addEventListener('mousemove', (e) => {
                        const rect = btn.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        btn.style.transform = \`translate(\${x * 0.2}px, \${y * 0.2}px)\`;
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.transform = 'translate(0px, 0px)';
                        btn.style.transition = 'transform 0.3s ease';
                    });
                    btn.addEventListener('mouseenter', () => {
                        btn.style.transition = 'none';
                    });
                }
            });
        });
    </script>
`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Image Upscaling
    // Match aida or aida-public urls that don't already have =s2048
    const imgUrlRegex = /(https:\/\/lh3\.googleusercontent\.com\/(?:aida|aida-public)\/[a-zA-Z0-9_-]+)(?![\w=-]*=s2048)/g;
    content = content.replace(imgUrlRegex, '$1=s2048');

    // 2. Inject CSS
    if (!content.includes('.cursor-dot')) {
        content = content.replace('</style>', cssToInject + '\\n</style>');
    }

    // 3. Inject HTML (Custom Cursor)
    if (!content.includes('id="cursor-dot"')) {
        content = content.replace(/(<body[^>]*>)/i, '$1\\n' + htmlToInject);
    }

    // 4. Inject JS
    if (!content.includes('vanilla-tilt.min.js')) {
        content = content.replace('</body>', jsToInject + '\\n</body>');
    }

    fs.writeFileSync(file, content);
    console.log(`Processed ${file}`);
});
