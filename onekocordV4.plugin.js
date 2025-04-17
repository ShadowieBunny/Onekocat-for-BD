/**
 * @name OnekoSmart
 * @author ShadowieBunny
 * @version 4.1.0
 * @description A smart Oneko cat that follows your cursor intelligently and uses accurate animations.
 */
const defaultSettings = {
    spriteUrl: "https://raw.githubusercontent.com/ShadowieBunny/Onekocat-for-BD/refs/heads/main/skins/oneko.png"
};

module.exports = class OnekoSmart {
    start() {
        this.cat = document.createElement("div");
        this.cat.id = "oneko-cat";
        const settings = this.getSettings();
        Object.assign(this.cat.style, {
            position: "fixed",
            width: "32px",
            height: "32px",
            backgroundImage: `url(${settings.spriteUrl})`,            
            imageRendering: "pixelated",
            zIndex: "9999",
            pointerEvents: "none",
            backgroundPosition: "-0px -0px",
        });
        document.body.appendChild(this.cat);

        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.catX = this.mouseX;
        this.catY = this.mouseY;
        this.direction = "right";
        this.frame = 0;
        this.frameTimer = 0;
        this.frameDelay = 150;
        this.purringDuration = 3000; // 3 seconds
        this.idleStartTime = null;
        this.idleAnimation = null;
        this.idleFrame = 0;
        this.idleFrameTimer = 0;
        this.idleFrameDelay = 300;

        this.speed = 2;

        this.moveListener = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };

        document.addEventListener("mousemove", this.moveListener);
        this.loop();
    }

    stop() {
        cancelAnimationFrame(this.raf);
        document.removeEventListener("mousemove", this.moveListener);
        this.cat?.remove();
    }
    getSettings() {
        return BdApi.loadData("OnekoSmart", "settings") || defaultSettings;
    }
    
    saveSettings(settings) {
        BdApi.saveData("OnekoSmart", "settings", settings);
    }
    
    getDirection(dx, dy) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= -22.5 && angle < 22.5) return "right";
        if (angle >= 22.5 && angle < 67.5) return "down-right";
        if (angle >= 67.5 && angle < 112.5) return "down";
        if (angle >= 112.5 && angle < 157.5) return "down-left";
        if (angle >= 157.5 || angle < -157.5) return "left";
        if (angle >= -157.5 && angle < -112.5) return "up-left";
        if (angle >= -112.5 && angle < -67.5) return "up";
        if (angle >= -67.5 && angle < -22.5) return "up-right";
        return "down";
    }

    loop = () => {
        const dx = this.mouseX - this.catX;
        const dy = this.mouseY - this.catY;
        const dist = Math.hypot(dx, dy);
        const now = Date.now();

        const isMoving = dist > 1;

        if (isMoving) {
            const moveAmount = Math.min(this.speed, dist / 10);
            const angle = Math.atan2(dy, dx);
            this.catX += Math.cos(angle) * moveAmount;
            this.catY += Math.sin(angle) * moveAmount;
            this.direction = this.getDirection(dx, dy);
        }

        this.cat.style.transform = `translate(${this.catX - -16}px, ${this.catY}px)`;

        if (now - this.frameTimer > this.frameDelay) {
            this.frame = (this.frame + 1) % 2; // Every direction has 2 movement frames
            this.frameTimer = now;
        }

        const frameMap = {
            "up": [ [32, 64], [32, 96] ],
            "down": [ [224, 320], [192, 480] ],
            "left": [ [128, 320], [128, 480] ],
            "right": [ [96, 0], [96, 160] ],
            "up-left": [ [0, 0], [32, 0] ],
            "up-right": [ [0, 64], [0, 480] ],
            "down-left": [ 	[160, 480], [192, 160] ],
            "down-right": [ [160, 160], [160, 320] ]
        };
        if (isMoving) {
            this.idleStartTime = null;
            this.idleAnimation = null;
        }        
        if (isMoving && frameMap[this.direction]) {
            const [x, y] = frameMap[this.direction][this.frame];
            this.cat.style.backgroundPosition = `-${x}px -${y}px`;
        } else {
  
    // IDLE ANIMATIONS
if (!this.idleStartTime) {
    this.idleStartTime = now;

    // Randomly pick idle animation (50% chance each)
    const choice = Math.random() < 0.5 ? "purring" : "sleeping";
    this.idleAnimation = choice;
    this.idleFrame = 0;
    this.idleFrameTimer = now;
}

const elapsed = now - this.idleStartTime;

if (this.idleAnimation === "purring") {
    const purringFrames = [
        [96, 480], [96, 320], [192, 0], [160, 0], [224, 0]
    ];

    if (elapsed >= this.purringDuration) {
        // Stop purring and go to idle sit pose
        this.idleAnimation = "sit";
    } else {
        if (now - this.idleFrameTimer > this.idleFrameDelay) {
            this.idleFrame = (this.idleFrame + 1) % purringFrames.length;
            this.idleFrameTimer = now;
        }

        const [x, y] = purringFrames[this.idleFrame];
        this.cat.style.backgroundPosition = `-${x}px -${y}px`;
    }
} else if (this.idleAnimation === "sit") {
    const sitFrames = {
        down: [96, 480],
        left: [96, 480],
        right: [96, 480],
        up: [96, 480],
        "down-left": [96, 480],
        "down-right": [96, 480],
        "up-left": [96, 480],
        "up-right": [96, 480]
    };
    const [x, y] = sitFrames[this.direction] || [96, 0];
    this.cat.style.backgroundPosition = `-${x}px -${y}px`;
} else if (this.idleAnimation === "sleeping") {
    const sleepingFrames = [
        [64, 0], [64, 160]
    ];

    if (now - this.idleFrameTimer > this.idleFrameDelay * 2) {
        this.idleFrame = (this.idleFrame + 1) % sleepingFrames.length;
        this.idleFrameTimer = now;
    }

    const [x, y] = sleepingFrames[this.idleFrame];
    this.cat.style.backgroundPosition = `-${x}px -${y}px`;
}
        }

        this.raf = requestAnimationFrame(this.loop);
    };
    getSettingsPanel() {
        const container = document.createElement("div");
        container.style.padding = "10px";
    
        const inputLabel = document.createElement("label");
        inputLabel.textContent = "Sprite URL:";
        inputLabel.style.display = "block";
        inputLabel.style.marginBottom = "5px";
    
        const input = document.createElement("input");
        input.type = "text";
        input.value = this.getSettings().spriteUrl;
        input.style.width = "100%";
        input.style.padding = "5px";
        input.style.border = "1px solid #ccc";
        input.style.borderRadius = "3px";
    
        input.addEventListener("change", () => {
            const newSettings = this.getSettings();
            newSettings.spriteUrl = input.value;
            this.saveSettings(newSettings);
            BdApi.alert("OnekoSmart", "Sprite URL updated. Please reload the plugin to apply the change.");
        });
    
        container.appendChild(inputLabel);
        container.appendChild(input);
    
        const fileLabel = document.createElement("label");
fileLabel.textContent = "Or select a local image:";
fileLabel.style.display = "block";
fileLabel.style.marginTop = "10px";

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.marginTop = "5px";

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const newSettings = this.getSettings();
        newSettings.spriteUrl = reader.result; // base64 data URL
        this.saveSettings(newSettings);
        BdApi.alert("OnekoSmart", "Local image loaded! Please reload the plugin to apply the change.");
    };
    reader.readAsDataURL(file);
});

container.appendChild(fileLabel);
container.appendChild(fileInput);

        return container;
    }    
};
