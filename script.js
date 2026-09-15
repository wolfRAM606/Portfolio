document.addEventListener('DOMContentLoaded', () => {
    // GSAP and ScrollTrigger registration
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- Navbar Toggle for Mobile ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- Hero Section Animation ---
    if (typeof gsap !== 'undefined') {
        gsap.from(".hero-subtitle", { opacity: 0, x: -50, duration: 1, ease: "power3.out", delay: 0.4 });
        gsap.from(".hero-title", { opacity: 0, x: -50, duration: 1, ease: "power3.out", delay: 0.6 });
        gsap.from(".hero-tagline", { opacity: 0, x: -50, duration: 1, ease: "power3.out", delay: 0.8 });
        gsap.from(".hero-actions", { opacity: 0, y: 20, duration: 1, ease: "power3.out", delay: 1.0 });
        gsap.from(".hero-right", { opacity: 0, x: 50, duration: 1.2, ease: "power3.out", delay: 0.8 });
        gsap.from(".scroll-indicator", { opacity: 0, y: -20, duration: 1, ease: "power2.out", delay: 1.4 });
    }

    // --- Section Scroll Animations ---
    const sections = document.querySelectorAll('section:not(#hero)');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // --- Contact Form Handling ---
    const contactForm = document.getElementById('contactForm');
    const formMessages = document.getElementById('form-messages');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name === '' || email === '' || message === '') {
                displayMessage('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                displayMessage('Please enter a valid email address.', 'error');
                return;
            }

            displayMessage('Thank you for your message, Sriram will get back to you soon!', 'success');
            setTimeout(() => {
                contactForm.reset();
                if (typeof gsap !== 'undefined') {
                    gsap.to(formMessages, { opacity: 0, y: -10, duration: 0.5, delay: 3, onComplete: () => {
                        formMessages.textContent = '';
                        formMessages.className = 'form-messages';
                    }});
                }
            }, 2000);
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    function displayMessage(message, type) {
        if (!formMessages) return;
        formMessages.textContent = message;
        formMessages.className = 'form-messages ' + type;
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(formMessages, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
        }
    }

    // =========================================================================
    // Dynamic Portfolio Data & In-Browser Admin CMS
    // =========================================================================
    let portfolioData = null;
    const ADMIN_PASSWORD = '$Profile1#';
    const STORAGE_KEY = 'portfolio_cms_data';
    const AUTH_KEY = 'portfolio_admin_auth';

    // Toast Notification Utility
    function showToast(msg, duration = 3000) {
        const toast = document.getElementById('adminStatusToast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }

    // Load Data
    async function loadPortfolioData() {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            try {
                portfolioData = JSON.parse(cached);
                renderProjects();
                renderExperience();
                return;
            } catch (e) {}
        }

        try {
            const res = await fetch('data/content.json');
            if (res.ok) {
                portfolioData = await res.json();
                renderProjects();
                renderExperience();
            }
        } catch (e) {
            console.log('Using pre-rendered static content as fallback.');
        }
    }

    function renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid || !portfolioData || !portfolioData.projects) return;

        grid.innerHTML = portfolioData.projects.map(proj => `
            <div class="project-card ${proj.featured ? 'featured' : ''}" data-id="${proj.id}">
                ${proj.badge ? `<span class="project-badge">${proj.badge}</span>` : ''}
                <h3>${proj.title}</h3>
                <p>${proj.description}</p>
                <div class="project-tags">
                    ${(proj.tags || []).map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" class="project-link" aria-label="View ${proj.title} on GitHub">View on GitHub <i class="fas fa-external-link-alt"></i></a>` : ''}
                    ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" class="project-link demo-link" aria-label="View ${proj.title} Demo">${proj.demoLabel || 'Live Demo'} <i class="fas fa-play-circle"></i></a>` : ''}
                </div>
            </div>
        `).join('');
    }

    function renderExperience() {
        const list = document.getElementById('journeyList');
        if (!list || !portfolioData || !portfolioData.experience) return;

        list.innerHTML = portfolioData.experience.map(exp => `
            <li>
                <h3><i class="${exp.icon || 'fas fa-briefcase'}"></i> ${exp.title}</h3>
                ${exp.role ? `<p><strong>${exp.role}</strong></p>` : ''}
                ${exp.description ? `<p>${exp.description}</p>` : ''}
                ${exp.items ? exp.items.map(it => `<p><strong>${it.name}</strong> — ${it.details}</p>`).join('') : ''}
            </li>
        `).join('');
    }

    // --- Admin Authentication & Controls ---
    const adminFloatingBar = document.getElementById('adminFloatingBar');
    const adminAuthModal = document.getElementById('adminAuthModal');
    const adminDashboardModal = document.getElementById('adminDashboardModal');
    const adminAuthForm = document.getElementById('adminAuthForm');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const adminAuthError = document.getElementById('adminAuthError');

    function checkAdminSession() {
        if (sessionStorage.getItem(AUTH_KEY) === 'true') {
            if (adminFloatingBar) adminFloatingBar.classList.remove('hidden');
        }
    }

    function openAuthModal() {
        if (sessionStorage.getItem(AUTH_KEY) === 'true') {
            openDashboardModal();
        } else {
            if (adminAuthModal) adminAuthModal.classList.add('active');
            if (adminPasswordInput) adminPasswordInput.focus();
        }
    }

    function closeAuthModal() {
        if (adminAuthModal) adminAuthModal.classList.remove('active');
        if (adminAuthError) adminAuthError.style.display = 'none';
        if (adminPasswordInput) adminPasswordInput.value = '';
    }

    function openDashboardModal() {
        if (adminDashboardModal) {
            adminDashboardModal.classList.add('active');
            populateAdminProjects();
            populateAdminExperience();
        }
    }

    function closeDashboardModal() {
        if (adminDashboardModal) adminDashboardModal.classList.remove('active');
    }

    // Trigger Admin via Keyboard Shortcut (Ctrl + Shift + A), Hash, or Footer Double Click
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            openAuthModal();
        }
    });

    if (window.location.hash === '#admin') {
        openAuthModal();
    }

    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright) {
        footerCopyright.style.cursor = 'pointer';
        footerCopyright.addEventListener('dblclick', openAuthModal);
    }

    // Auth Form Submit
    if (adminAuthForm) {
        adminAuthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const entered = adminPasswordInput.value.trim();

            if (entered === ADMIN_PASSWORD) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                closeAuthModal();
                if (adminFloatingBar) adminFloatingBar.classList.remove('hidden');
                showToast('🔓 Admin CMS Unlocked!');
                openDashboardModal();
            } else {
                if (adminAuthError) {
                    adminAuthError.textContent = 'Incorrect admin password. Please try again.';
                    adminAuthError.style.display = 'block';
                }
            }
        });
    }

    // Close buttons
    const adminAuthCloseBtn = document.getElementById('adminAuthCloseBtn');
    if (adminAuthCloseBtn) adminAuthCloseBtn.addEventListener('click', closeAuthModal);

    const adminDashboardCloseBtn = document.getElementById('adminDashboardCloseBtn');
    if (adminDashboardCloseBtn) adminDashboardCloseBtn.addEventListener('click', closeDashboardModal);

    const adminOpenDashboardBtn = document.getElementById('adminOpenDashboardBtn');
    if (adminOpenDashboardBtn) adminOpenDashboardBtn.addEventListener('click', openDashboardModal);

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(AUTH_KEY);
            if (adminFloatingBar) adminFloatingBar.classList.add('hidden');
            closeDashboardModal();
            showToast('🔒 Logged out of Admin Mode');
        });
    }

    // Tab Switching
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');
        });
    });

    // --- Projects Management in Admin ---
    function populateAdminProjects() {
        const list = document.getElementById('adminProjectsList');
        if (!list || !portfolioData || !portfolioData.projects) return;

        list.innerHTML = portfolioData.projects.map((proj, idx) => `
            <div class="admin-item-row" data-id="${proj.id}">
                <div class="admin-item-info">
                    <h4>${proj.title} ${proj.featured ? '<span style="color: var(--primary-color); font-size: 0.75rem;">(Featured)</span>' : ''}</h4>
                    <p>${(proj.tags || []).join(' • ')}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="admin-btn-sm" onclick="window.editProject(${idx})"><i class="fas fa-pen"></i> Edit</button>
                    <button class="admin-btn-sm" style="color: #CF6679;" onclick="window.deleteProject(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    const adminAddProjectBtn = document.getElementById('adminAddProjectBtn');
    const adminProjectFormContainer = document.getElementById('adminProjectFormContainer');
    const adminProjectForm = document.getElementById('adminProjectForm');
    const adminCancelProjectFormBtn = document.getElementById('adminCancelProjectFormBtn');

    if (adminAddProjectBtn) {
        adminAddProjectBtn.addEventListener('click', () => {
            document.getElementById('adminProjectFormTitle').textContent = 'Add New Project';
            adminProjectForm.reset();
            document.getElementById('projFormId').value = '';
            adminProjectFormContainer.style.display = 'block';
        });
    }

    if (adminCancelProjectFormBtn) {
        adminCancelProjectFormBtn.addEventListener('click', () => {
            adminProjectFormContainer.style.display = 'none';
        });
    }

    window.editProject = function(index) {
        if (!portfolioData || !portfolioData.projects[index]) return;
        const p = portfolioData.projects[index];
        document.getElementById('adminProjectFormTitle').textContent = `Edit "${p.title}"`;
        document.getElementById('projFormId').value = p.id;
        document.getElementById('projFormTitle').value = p.title;
        document.getElementById('projFormDesc').value = p.description;
        document.getElementById('projFormTags').value = (p.tags || []).join(', ');
        document.getElementById('projFormGithub').value = p.githubUrl || '';
        document.getElementById('projFormDemo').value = p.demoUrl || '';
        document.getElementById('projFormDemoLabel').value = p.demoLabel || '';
        document.getElementById('projFormBadge').value = p.badge || '';
        document.getElementById('projFormFeatured').checked = !!p.featured;
        adminProjectFormContainer.style.display = 'block';
    };

    window.deleteProject = function(index) {
        if (!portfolioData || !portfolioData.projects[index]) return;
        if (confirm(`Delete project "${portfolioData.projects[index].title}"?`)) {
            portfolioData.projects.splice(index, 1);
            savePortfolioData();
            populateAdminProjects();
            renderProjects();
            showToast('🗑️ Project deleted');
        }
    };

    if (adminProjectForm) {
        adminProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('projFormId').value || ('proj-' + Date.now());
            const title = document.getElementById('projFormTitle').value.trim();
            const description = document.getElementById('projFormDesc').value.trim();
            const tags = document.getElementById('projFormTags').value.split(',').map(s => s.trim()).filter(Boolean);
            const githubUrl = document.getElementById('projFormGithub').value.trim();
            const demoUrl = document.getElementById('projFormDemo').value.trim();
            const demoLabel = document.getElementById('projFormDemoLabel').value.trim() || 'Live Demo';
            const badge = document.getElementById('projFormBadge').value.trim();
            const featured = document.getElementById('projFormFeatured').checked;

            const existingIdx = portfolioData.projects.findIndex(p => p.id === id);
            const projectObj = { id, title, description, tags, githubUrl, demoUrl, demoLabel, badge, featured };

            if (existingIdx >= 0) {
                portfolioData.projects[existingIdx] = projectObj;
            } else {
                portfolioData.projects.unshift(projectObj); // Add to top
            }

            savePortfolioData();
            populateAdminProjects();
            renderProjects();
            adminProjectFormContainer.style.display = 'none';
            showToast('✨ Project saved successfully!');
        });
    }

    // --- Resume PDF Upload ---
    const dropzone = document.getElementById('adminResumeDropzone');
    const fileInput = document.getElementById('adminResumeFileInput');
    const resumeStatus = document.getElementById('adminResumeStatus');
    const resumeDownloadBtn = document.getElementById('resumeDownloadBtn');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleResumeUpload(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleResumeUpload(e.target.files[0]);
            }
        });
    }

    function handleResumeUpload(file) {
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const blobUrl = URL.createObjectURL(file);
            if (resumeDownloadBtn) {
                resumeDownloadBtn.href = blobUrl;
                resumeDownloadBtn.download = file.name;
            }
            if (resumeStatus) {
                resumeStatus.textContent = `✅ Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Active for download!`;
                resumeStatus.style.display = 'block';
            }
            showToast('📄 Resume PDF updated live!');
        };
        reader.readAsDataURL(file);
    }

    // --- Experience List in Admin ---
    function populateAdminExperience() {
        const list = document.getElementById('adminExperienceList');
        if (!list || !portfolioData || !portfolioData.experience) return;

        list.innerHTML = portfolioData.experience.map(exp => `
            <div class="admin-item-row">
                <div class="admin-item-info">
                    <h4>${exp.title}</h4>
                    <p>${exp.role || ''}</p>
                </div>
            </div>
        `).join('');
    }

    // --- Persistence & Publishing ---
    function savePortfolioData() {
        if (!portfolioData) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
    }

    const adminPublishBtn = document.getElementById('adminPublishBtn');
    const adminPublishChangesBtn = document.getElementById('adminPublishChangesBtn');
    const adminDownloadBackupBtn = document.getElementById('adminDownloadBackupBtn');
    const adminResetDefaultBtn = document.getElementById('adminResetDefaultBtn');

    async function handlePublish() {
        showToast('🚀 Publishing content...');
        savePortfolioData();

        try {
            const res = await fetch('/api/update-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: portfolioData, token: 'authenticated' })
            });

            if (res.ok) {
                const data = await res.json();
                showToast(`✅ ${data.message || 'Published successfully!'}`);
            } else {
                showToast('✅ Saved to browser! Deployed changes reflect on site.');
            }
        } catch (e) {
            showToast('✅ Saved locally. Ready to commit/deploy.');
        }
    }

    if (adminPublishBtn) adminPublishBtn.addEventListener('click', handlePublish);
    if (adminPublishChangesBtn) adminPublishChangesBtn.addEventListener('click', handlePublish);

    if (adminDownloadBackupBtn) {
        adminDownloadBackupBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "portfolio_content_backup.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('📥 content.json backup downloaded');
        });
    }

    if (adminResetDefaultBtn) {
        adminResetDefaultBtn.addEventListener('click', async () => {
            if (confirm('Reset all modifications to default content.json?')) {
                localStorage.removeItem(STORAGE_KEY);
                await loadPortfolioData();
                populateAdminProjects();
                populateAdminExperience();
                showToast('🔄 Reset to default content.');
            }
        });
    }

    // Initial Load & Session Check
    loadPortfolioData();
    checkAdminSession();
});