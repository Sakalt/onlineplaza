const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight * 0.8,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let controls = {};

function preload() {
    this.load.image('sky', '/assets/sky.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.spritesheet('player', '/assets/player.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(400, 300, 'sky');

    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    // Setup button events
    document.getElementById('moveLeft').addEventListener('touchstart', () => player.setVelocityX(-160));
    document.getElementById('moveRight').addEventListener('touchstart', () => player.setVelocityX(160));
    document.getElementById('jump').addEventListener('touchstart', () => {
        if (player.body.touching.down) {
            player.setVelocityY(-330);
        }
    });
    document.getElementById('attack').addEventListener('touchstart', () => {
        // Handle attack action
        console.log('Attack!');
    });

    // Emoji button events
    document.querySelectorAll('.emoji-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const emoji = event.target.getAttribute('data-emoji');
            socket.send(emoji);
        });
    });
}

function update() {
    if (controls.left) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (controls.right) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
}

const socket = new WebSocket('ws://localhost:3000');

const chatInput = document.getElementById('chatInput');
const messages = document.getElementById('messages');

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && chatInput.value) {
        socket.send(chatInput.value);
        chatInput.value = '';
    }
});

socket.addEventListener('message', (event) => {
    const message = document.createElement('div');
    message.textContent = event.data;
    messages.appendChild(message);
});
