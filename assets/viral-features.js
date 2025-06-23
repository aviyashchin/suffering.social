// ===== VIRAL FEATURES FOR SOCIAL MEDIA COST CALCULATOR =====

// 🎯 Animated Counter Class for Satisfying Number Updates
class ViralAnimatedCounter {
    constructor(element, options = {}) {
        this.element = element;
        this.duration = options.duration || 1200;
        this.currentValue = 0;
    }
    
    animateTo(newValue, oldValue = this.currentValue) {
        this.element.classList.add('updating');
        this.triggerHaptic();
        
        const startTime = performance.now();
        const change = newValue - oldValue;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const easedProgress = this.easeOutExpo(progress);
            const current = oldValue + (change * easedProgress);
            
            this.element.textContent = this.formatValue(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.element.classList.remove('updating');
                this.currentValue = newValue;
                this.onComplete(newValue);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    
    formatValue(value) {
        if (this.element.dataset.format === 'currency') {
            return this.formatCurrency(value);
        }
        return value.toFixed(0);
    }
    
    formatCurrency(num) {
        if (num >= 1e12) return `$${(num/1e12).toFixed(1)}T`;
        if (num >= 1e9) return `$${(num/1e9).toFixed(1)}B`;
        if (num >= 1e6) return `$${(num/1e6).toFixed(1)}M`;
        return `$${Math.round(num).toLocaleString()}`;
    }
    
    triggerHaptic() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
    
    onComplete(value) {
        if (value >= 1e12) {
            this.celebrate();
        }
        if (value >= 3e12) {
            window.viralFeatures?.triggerShockReaction(value);
        }
    }
    
    celebrate() {
        this.element.style.animation = 'celebrate 0.6s ease-out';
        setTimeout(() => {
            this.element.style.animation = '';
        }, 600);
    }
}

// 🔥 Live Social Proof Engine
class LiveSocialProof {
    constructor() {
        this.baseStats = {
            calculations: 47382,
            shares: 12847,
            startTime: Date.now()
        };
        
        this.locations = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];
        this.reactions = [
            'This is bigger than NASA\'s entire budget!',
            'I had no idea it was this bad',
            'This should be front page news',
            'Why isn\'t everyone talking about this?'
        ];
        
        this.init();
    }
    
    init() {
        this.startLiveUpdates();
        this.generateActivityFeed();
        this.createNotificationSystem();
    }
    
    startLiveUpdates() {
        setInterval(() => {
            this.updateLiveStats();
        }, 5000);
    }
    
    updateLiveStats() {
        const elapsed = (Date.now() - this.baseStats.startTime) / 1000;
        const newCalculations = this.baseStats.calculations + Math.floor(elapsed * 0.3);
        const newShares = this.baseStats.shares + Math.floor(elapsed * 0.1);
        
        const calcEl = document.getElementById('total-calculations');
        const shareEl = document.getElementById('total-shares');
        
        if (calcEl) calcEl.textContent = newCalculations.toLocaleString();
        if (shareEl) shareEl.textContent = newShares.toLocaleString();
    }
    
    generateActivityFeed() {
        const activities = [
            () => `Someone in ${this.randomLocation()} just discovered a $${this.randomAmount()}T impact`,
            () => `User shocked: "${this.randomReaction()}"`,
            () => `Shared ${this.randomShareCount()} times in the last hour`
        ];
        
        setInterval(() => {
            const activity = activities[Math.floor(Math.random() * activities.length)]();
            this.addActivityItem(activity);
        }, 8000);
    }
    
    addActivityItem(text) {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.textContent = text;
        
        feed.insertBefore(item, feed.firstChild);
        
        while (feed.children.length > 5) {
            feed.removeChild(feed.lastChild);
        }
        
        setTimeout(() => item.classList.add('show'), 100);
    }
    
    randomLocation() {
        return this.locations[Math.floor(Math.random() * this.locations.length)];
    }
    
    randomReaction() {
        return this.reactions[Math.floor(Math.random() * this.reactions.length)];
    }
    
    randomAmount() {
        return (2.0 + Math.random() * 2.0).toFixed(1);
    }
    
    randomShareCount() {
        return Math.floor(20 + Math.random() * 80);
    }
    
    createNotificationSystem() {
        if (!document.getElementById('viral-notifications')) {
            const container = document.createElement('div');
            container.id = 'viral-notifications';
            container.className = 'viral-notifications';
            document.body.appendChild(container);
        }
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('viral-notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `viral-notification viral-notification-${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// 🎮 Achievement System
class AchievementSystem {
    constructor() {
        this.achievements = {
            'first_calculation': {
                name: 'First Steps',
                description: 'Completed your first calculation',
                icon: '🎯',
                points: 10
            },
            'social_sharer': {
                name: 'Awareness Spreader',
                description: 'Shared results on social media',
                icon: '📢',
                points: 50
            },
            'truth_seeker': {
                name: 'Truth Seeker',
                description: 'Discovered a $3T+ scenario',
                icon: '😱',
                points: 30
            }
        };
        
        this.userProgress = this.loadProgress();
        this.init();
    }
    
    init() {
        this.trackShareAttempts();
    }
    
    loadProgress() {
        const saved = localStorage.getItem('viral-achievements');
        return saved ? JSON.parse(saved) : { achievements: [], points: 0 };
    }
    
    saveProgress() {
        localStorage.setItem('viral-achievements', JSON.stringify(this.userProgress));
    }
    
    checkAchievement(action, data = {}) {
        switch(action) {
            case 'calculation_complete':
                this.unlock('first_calculation');
                break;
            case 'social_share':
                this.unlock('social_sharer');
                break;
            case 'high_value_discovered':
                if (data.value >= 3e12) {
                    this.unlock('truth_seeker');
                }
                break;
        }
    }
    
    unlock(achievementId) {
        if (this.userProgress.achievements.includes(achievementId)) return;
        
        this.userProgress.achievements.push(achievementId);
        this.userProgress.points += this.achievements[achievementId].points;
        this.showAchievementUnlock(this.achievements[achievementId]);
        this.saveProgress();
    }
    
    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-unlock';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
                <div class="achievement-points">+${achievement.points}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    trackShareAttempts() {
        document.addEventListener('click', (e) => {
            if (e.target.id && e.target.id.includes('share')) {
                this.checkAchievement('social_share');
            }
        });
    }
}

// 📱 Viral Share Generator
class ViralShareGenerator {
    shareToSocial(platform, data) {
        const { totalCost } = data;
        const costText = this.formatCurrency(totalCost);
        
        const messages = {
            twitter: `🚨 Social media costs society ${costText}! Calculate yours: suffering.social #SocialMediaCost`,
            linkedin: `New research reveals social media's hidden economic cost: ${costText}. suffering.social`,
            facebook: `Did you know social media costs society ${costText}? Check it out: suffering.social`
        };
        
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://suffering.social')}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://suffering.social')}`
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    }
    
    formatCurrency(num) {
        if (num >= 1e12) return `$${(num/1e12).toFixed(1)}T`;
        if (num >= 1e9) return `$${(num/1e9).toFixed(1)}B`;
        return `$${(num/1e6).toFixed(1)}M`;
    }
}

// 🎯 Curiosity Gap Headlines
class ViralHeadlines {
    constructor() {
        this.headlines = [
            "You won't believe what social media ACTUALLY costs society...",
            "This number will make you delete Instagram immediately 😱",
            "Harvard researchers reveal social media's $2.5T secret",
            "The hidden cost that tech companies don't want you to know"
        ];
        
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        const headlineEl = document.querySelector('h2');
        if (headlineEl && headlineEl.textContent.includes('Interactive')) {
            this.rotateHeadlines(headlineEl);
        }
    }
    
    rotateHeadlines(element) {
        setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.headlines.length;
            this.animateHeadlineChange(element, this.headlines[this.currentIndex]);
        }, 12000);
    }
    
    animateHeadlineChange(element, newText) {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300);
    }
}

// 🚀 Main Viral Features Controller
class ViralFeatures {
    constructor() {
        this.socialProof = new LiveSocialProof();
        this.achievements = new AchievementSystem();
        this.shareGenerator = new ViralShareGenerator();
        this.headlines = new ViralHeadlines();
        
        this.init();
    }
    
    init() {
        this.enhanceExistingElements();
        this.addViralElements();
        this.setupEventListeners();
        
        setTimeout(() => {
            this.achievements.checkAchievement('calculation_complete');
        }, 2000);
    }
    
    enhanceExistingElements() {
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', () => {
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
            });
        });
        
        this.enhanceShareButtons();
    }
    
    addViralElements() {
        this.addUrgencyBanner();
    }
    

    
    addUrgencyBanner() {
        const banner = document.createElement('div');
        banner.className = 'urgency-banner';
        banner.innerHTML = `
            <div class="urgency-content">
                ⏰ Every second costs society 
                <span class="cost-ticker" id="cost-ticker">$78,704</span> more
            </div>
        `;
        
        const clockBar = document.getElementById('national-debt-clock-bar');
        if (clockBar && clockBar.nextSibling) {
            clockBar.parentNode.insertBefore(banner, clockBar.nextSibling);
        }
        
        this.startUrgencyTimer();
    }
    
    startUrgencyTimer() {
        const dailyCost = 6800000000;
        const costPerSecond = dailyCost / (24 * 60 * 60);
        const startTime = Date.now();
        
        setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const currentCost = elapsed * costPerSecond;
            
            const ticker = document.getElementById('cost-ticker');
            if (ticker) {
                ticker.textContent = '$' + Math.round(currentCost).toLocaleString();
            }
        }, 1000);
    }
    
    enhanceShareButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.id && e.target.id.includes('share')) {
                const platform = e.target.id.replace('share-', '');
                const totalCost = this.getCurrentTotalCost();
                
                this.shareGenerator.shareToSocial(platform, { totalCost });
                this.achievements.checkAchievement('social_share');
            }
        });
    }
    
    setupEventListeners() {
        document.addEventListener('calculationUpdated', (e) => {
            const value = e.detail.totalCost;
            this.achievements.checkAchievement('high_value_discovered', { value });
        });
    }
    
    getCurrentTotalCost() {
        const totalEl = document.getElementById('total-cost');
        if (!totalEl) return 2500000000000;
        
        const text = totalEl.textContent.replace(/[$,]/g, '');
        if (text.includes('T')) return parseFloat(text) * 1e12;
        if (text.includes('B')) return parseFloat(text) * 1e9;
        return parseFloat(text) || 2500000000000;
    }
    
    triggerShockReaction(value) {
        this.socialProof.showNotification(`😱 You just discovered a $${(value/1e12).toFixed(1)}T crisis!`, 'shock');
    }
}

// Initialize viral features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.viralFeatures = new ViralFeatures();
    });
} else {
    window.viralFeatures = new ViralFeatures();
}

window.ViralFeatures = ViralFeatures; 