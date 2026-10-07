const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /onPopoverRender:\s*\(popover,\s*\{\s*state\s*\}\)\s*=>\s*\{[\s\S]*?steps:\s*steps/g;

const newBlock = `onPopoverRender: (popover, { state }) => {
                document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));
                
                const stepIndex = state.activeIndex;
                const currentStep = steps[stepIndex];
                if (!currentStep) return;
                
                // Add glow to current element
                if (currentStep.element) {
                    const el = document.querySelector(currentStep.element);
                    if (el) el.classList.add('tour-glow');
                }

                // If it's the last step and has nextRoute, set global active
                if (currentStep.popover?.nextRoute) {
                    localStorage.setItem('cigar_global_tour_active', 'true');
                }

                const nextBtn = popover.wrapper.querySelector('.driver-popover-next-btn');
                if (nextBtn) {
                    if (currentStep.mustHover) {
                        nextBtn.style.display = 'none';
                        const el = document.querySelector(currentStep.element);
                        if (el && !el.dataset.hoverBound) {
                            el.dataset.hoverBound = 'true';
                            el.addEventListener('mouseenter', () => {
                                setTimeout(() => driverObj.moveNext(), 600);
                            }, { once: true });
                        }
                    } else if (currentStep.mustClick) {
                        nextBtn.style.display = 'none';
                        const el = document.querySelector(currentStep.element);
                        if (el && !el.dataset.clickBound) {
                            el.dataset.clickBound = 'true';
                            el.addEventListener('click', () => {
                                // Destroy immediately if it's the last step to prevent hanging overlay
                                if (stepIndex === steps.length - 1 && currentStep.popover?.nextRoute) {
                                    document.querySelectorAll('.tour-glow').forEach(e => e.classList.remove('tour-glow'));
                                    driverObj.destroy();
                                    router.push(currentStep.popover.nextRoute);
                                } else {
                                    setTimeout(() => driverObj.moveNext(), 600);
                                }
                            }, { once: true });
                        }
                    } else if (currentStep.popover?.nextRoute && stepIndex === steps.length - 1) {
                        nextBtn.innerHTML = 'Next Page &rarr;';
                    }
                }
            },
            steps: steps`;

content = content.replace(regex, newBlock);
fs.writeFileSync(file, content);
console.log('Fixed TourContext.js perfectly');
