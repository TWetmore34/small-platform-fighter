const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = .7
class Sprite {
    // adding obj wrapper around this makes it so theres only ever one prop passed in, and all its values are named. much more readable
    constructor({ position, velocity, color='red', damage, direction }) {
        this.position = position
        this.velocity = velocity
        // for sprites of different sizes, add params again
        this.height = 150
        this.width = 50
        this.attackBox = {
            position: this.position,
            width: 100,
            height: 50,
        }
        this.rangedAttack = {
            position: this.position,
            width: 50,
            height: 50,
            velocity: 3
        }
        this.lastKey,
        this.color = color,
        this.isAttacking,
        this.attackConnect,
        this.damage = damage,
        this.health = 0,
        this.direction = direction
        this.lockedIn
        this.stocks = 3
    }
    // draw feels like an init function imo
    draw() {
        // character hitbox
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        // attack hitbox
        if(this.isAttacking){
        c.fillStyle = 'green'
        if (this.direction === 'right') {
        c.fillRect(
            this.attackBox.position.x, 
            this.attackBox.position.y, 
            this.attackBox.width, 
            this.attackBox.height)
        } else if (this.direction = 'left') {
            c.fillRect(
                this.attackBox.position.x + this.width, 
                this.attackBox.position.y, 
                this.attackBox.width * -1, 
                this.attackBox.height)
        }
        c.fillStyle = 'yellow'
        if (this.rangedAttacking) {
        c.fillRect(
            this.rangedAttack.position.x,
            this.rangedAttack.position.y,
            this.rangedAttack.width,
            this.rangedAttack.height
    )}}}

    update() {
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x

        if (this.stocks <= 0){
            alert(`game over! ${this.color} loses`)
        }
        if(this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0
        } else this.velocity.y += gravity
        // reset on death
        if(this.position.x + this.width >= canvas.width || this.position.x + this.width <= 0) {
            this.stocks--
            this.position.x = canvas.width / 2
            this.position.y = 0
            this.health = 0
            this.velocity.x = 0
            this.velocity.y = 0
        }
    };

    attack() {
        this.isAttacking = true
        // limits animation time!
        setTimeout(() => {
            this.isAttacking = false
            this.attackConnect = false
        }
        , 500)
    }
};

const player = new Sprite({
    position: {
    x: 0,
    y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    damage: {
        attack: 5,
        knockback: 1
    },
    direction: 'right'
});

const enemy = new Sprite({
    position: {
    x: 400,
    y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    damage: {
        attack: 5,
        knockback: 1
    },
    direction: 'left'
});


const keys = {
    a: {
        pressed: false,    
    },
    d: {
        pressed: false,    
    },
    w: {
        pressed: false
    },
    j: {
        pressed: false
    },
    l: {
        pressed: false
    },
    i: {
        pressed: false
    }
}
// checks if two rectangles collide
function rectangularCollision(rectangle1, rectangle2) {
    return (rectangle1.attackBox.width + rectangle1.attackBox.position.x >= rectangle2.position.x 
            && rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width
            && rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y
            && rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
            )
    
}

function angleCheck(weapon, target) {
    let slopeY = weapon.attackBox.position.y - target.position.y;
    let slopeX = weapon.attackBox.position.x - target.position.x
    let angle = Math.atan(-1) * (slopeY/slopeX)
    let ratio = angle / 360
    return ratio
}

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.update()
    enemy.update()
    // update player health
    document.getElementById('player-health').innerHTML = `${player.health}%` 

    // update enemy health
    document.getElementById('enemy-health').innerHTML = `${enemy.health}%` 

    // knockback system on player hit
    if (player.lockedIn && enemy.direction === 'right'){
        player.velocity.x += enemy.damage.knockback + (player.health * angleCheck(player, enemy)) / 4
        player.velocity.y -= enemy.damage.knockback + (player.health * angleCheck(player, enemy)) / 4
    } else if(player.lockedIn && enemy.direction === 'left') {
        player.velocity.x -= enemy.damage.knockback + (player.health * angleCheck(player, enemy)) / 4
        player.velocity.y -= enemy.damage.knockback + (player.health * angleCheck(player, enemy)) / 4
    }
    else {
    player.velocity.x = 0
    }
    // knockback system on enemy hit
    if (enemy.lockedIn && player.direction === 'right'){
        enemy.velocity.x += player.damage.knockback + (enemy.health * angleCheck(enemy, player)) / 4
        enemy.velocity.y -= player.damage.knockback + (enemy.health * angleCheck(enemy, player)) / 4
    } else if(enemy.lockedIn && player.direction === 'left') {
        enemy.velocity.x -= player.damage.knockback + (enemy.health * angleCheck(enemy, player)) / 4
        enemy.velocity.y -= player.damage.knockback + (enemy.health * angleCheck(enemy, player)) / 4
    }
    else {
    enemy.velocity.x = 0
    }

    if (!player.lockedIn){
    if(keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -10
        if(!enemy.lockedIn){
            player.direction = 'left'
            }
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 10
        if(!enemy.lockedIn){
        player.direction = 'right'
        }
    }}

    // enemy movement
    if (!enemy.lockedIn) {
    if(keys.l.pressed && enemy.lastKey === 'l') {
        enemy.velocity.x = 10
        if (!player.lockedIn) {
            enemy.direction = 'right'
            }
    } else if (keys.j.pressed && enemy.lastKey === 'j') {
        enemy.velocity.x = -10
        if (!player.lockedIn) {
        enemy.direction = 'left'
        }
    }
}


    if(rectangularCollision(player, enemy) 
    && player.isAttacking
    && !player.attackConnect) {
            // if attack conects, do not run function again till attack animation ends
            player.attackConnect = true
            // health
            enemy.health += player.damage.attack
            // keeps hit player from moving for .5s
            enemy.lockedIn = true


            setTimeout(() => {
                enemy.lockedIn = false
            }, enemy.health*10)
    }
    if(rectangularCollision(enemy, player) 
    && enemy.isAttacking
    && !enemy.attackConnect) {
            // if attack conects, do not run function again till attack animation ends
            enemy.attackConnect = true
            // set health
            player.health += enemy.damage.attack
            // keeps hit player from moving for .5s
            player.lockedIn = true
            // set knockback

            setTimeout(() => {
                player.lockedIn = false
            }, player.health*10)
    }

}

animate()

let doubleJump = 0
window.addEventListener('keydown', (event) => {
    // player
    switch (event.key) {
        case 'd':
            keys.d.pressed = true
            return player.lastKey = 'd'
            break;
        case 'a':
            keys.a.pressed = true
            return player.lastKey = 'a'
            break;
        case 'w':
            doubleJump++
            if(player.position.y + player.height + player.velocity.y >= canvas.height) {
                doubleJump = 0
            }
            if(doubleJump >= 2){
                return player.velocity.y -= gravity
            } else {
                return player.velocity.y = -20
            }
            break;
        case ' ':
            return player.attack()
            break
    // enemy
    case 'l':
        keys.l.pressed = true
        return enemy.lastKey = 'l'
        break;
    case 'j':
        keys.j.pressed = true
        return enemy.lastKey = 'j'
        break;
    case 'i':
        doubleJump++
        if(enemy.position.y + enemy.height + enemy.velocity.y >= canvas.height) {
            return doubleJump = 0
        }
        if(doubleJump >= 2){
            return enemy.velocity.y -= gravity
        } else {
            return enemy.velocity.y = -20
        }
        break;
    case 'Meta':
        enemy.attack()
        break
        
    }}
)

window.addEventListener('keyup', (event) => {
    // player
    event.preventDefault()
    event.stopPropagation()
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            return player.lastKey = 'a'
            break;
        case 'a':
            keys.a.pressed = false
            return player.lastKey = 'd'
            break;
    }
// enemy
    switch (event.key) {
        case 'l':
            keys.l.pressed = false
            return enemy.lastKey = 'j'
            break;
        case 'j':
            keys.j.pressed = false
            return enemy.lastKey = 'l'
            break;
        case 'i':
            keys.i.pressed = false
            return enemy.lastKey = 'i'
            break;
    }
});