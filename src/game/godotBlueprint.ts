/**
 * Project Iron Storm - Godot 4 Engine Architecture & GDScript Blueprints
 * Complete technical reference and downloadable Godot 4.3 project structure
 */

export interface GodotFile {
  path: string;
  category: 'Configuration' | 'Player & Weapons' | 'Vehicles' | 'Boss & Enemies' | 'World & FX';
  description: string;
  code: string;
}

export const GODOT_PROJECT_FILES: GodotFile[] = [
  {
    path: 'project.godot',
    category: 'Configuration',
    description: 'Godot 4.3 project settings, 2D viewport, physics layers, and input mappings.',
    code: `; Engine configuration file for PROJECT IRON STORM (Godot 4.3+)
config_version=5

[application]
config/name="Project Iron Storm"
config/description="Classic 2D Arcade Run & Gun Platformer inspired by Metal Slug"
run/main_scene="res://scenes/stages/Stage1_VerdantStronghold.tscn"
config/features=PackedStringArray("4.3", "Forward Plus")

[display]
window/size/viewport_width=1280
window/size/viewport_height=720
window/size/mode=0
window/size/resizable=true
window/stretch/mode="canvas_items"
window/stretch/aspect="keep"

[rendering]
renderer/rendering_method="forward_plus"
textures/canvas_textures/default_texture_filter=2 ; Linear with Mipmaps for HD 2D
anti_aliasing/quality/msaa_2d=2

[input]
p1_move_left={ "deadzone": 0.5, "events": [Key(A), JoypadMotion(0, AXIS_LEFT_X, -1.0)] }
p1_move_right={ "deadzone": 0.5, "events": [Key(D), JoypadMotion(0, AXIS_LEFT_X, 1.0)] }
p1_aim_up={ "deadzone": 0.5, "events": [Key(W), JoypadMotion(0, AXIS_LEFT_Y, -1.0)] }
p1_crouch={ "deadzone": 0.5, "events": [Key(S), JoypadMotion(0, AXIS_LEFT_Y, 1.0)] }
p1_fire={ "events": [Key(J), JoypadButton(0, JOY_BUTTON_X)] }
p1_jump={ "events": [Key(K), JoypadButton(0, JOY_BUTTON_A)] }
p1_bomb={ "events": [Key(L), JoypadButton(0, JOY_BUTTON_B)] }
p1_mount={ "events": [Key(E), JoypadButton(0, JOY_BUTTON_Y)] }

p2_move_left={ "events": [Key(Left), JoypadMotion(1, AXIS_LEFT_X, -1.0)] }
p2_move_right={ "events": [Key(Right), JoypadMotion(1, AXIS_LEFT_X, 1.0)] }
p2_aim_up={ "events": [Key(Up), JoypadMotion(1, AXIS_LEFT_Y, -1.0)] }
p2_crouch={ "events": [Key(Down), JoypadMotion(1, AXIS_LEFT_Y, 1.0)] }
p2_fire={ "events": [Key(Kp1), JoypadButton(1, JOY_BUTTON_X)] }
p2_jump={ "events": [Key(Kp2), JoypadButton(1, JOY_BUTTON_A)] }
p2_bomb={ "events": [Key(Kp3), JoypadButton(1, JOY_BUTTON_B)] }
p2_mount={ "events": [Key(Kp0), JoypadButton(1, JOY_BUTTON_Y)] }
`
  },
  {
    path: 'scripts/characters/Player.gd',
    category: 'Player & Weapons',
    description: 'CharacterBody2D controller: 8-way directional aiming, states, and co-op input handling.',
    code: `extends CharacterBody2D
class_name IronPlayer

enum State { IDLE, RUN, JUMP, FALL, CROUCH, MOUNTED, HURT, DEAD }

@export var player_id: int = 1
@export var speed: float = 240.0
@export var jump_impulse: float = -580.0
@export var gravity: float = 1400.0

@onready var weapon_manager: WeaponManager = $WeaponManager
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var aim_pivot: Marker2D = $AimPivot

var current_state: State = State.IDLE
var facing: int = 1
var aim_dir: Vector2 = Vector2.RIGHT
var is_invulnerable: bool = false
var lives: int = 3
var bombs: int = 10
var score: int = 0

func _physics_process(delta: float) -> void:
    if current_state == State.DEAD or current_state == State.MOUNTED:
        return

    apply_gravity(delta)
    handle_input()
    move_and_slide()
    update_animations()

func handle_input() -> void:
    var prefix = "p%d_" % player_id
    var move_x = Input.get_axis(prefix + "move_left", prefix + "move_right")
    var up = Input.is_action_pressed(prefix + "aim_up")
    var down = Input.is_action_pressed(prefix + "crouch")

    # Crouching logic
    var is_crouching = down and is_on_floor()
    if is_crouching:
        velocity.x = 0
        current_state = State.CROUCH
    else:
        velocity.x = move_x * speed
        if move_x != 0:
            facing = 1 if move_x > 0 else -1
            sprite.scale.x = facing

    # 8-Directional Aim Calculation
    if up:
        if move_x != 0:
            aim_dir = Vector2(facing * 0.707, -0.707)
        else:
            aim_dir = Vector2.UP
    elif down and not is_on_floor():
        if move_x != 0:
            aim_dir = Vector2(facing * 0.707, 0.707)
        else:
            aim_dir = Vector2.DOWN
    else:
        aim_dir = Vector2(facing, 0)

    aim_pivot.rotation = aim_dir.angle()

    # Jump
    if Input.is_action_just_pressed(prefix + "jump") and is_on_floor() and not is_crouching:
        velocity.y = jump_impulse
        current_state = State.JUMP

    # Fire Weapon
    if Input.is_action_pressed(prefix + "fire"):
        weapon_manager.try_fire(aim_dir, global_position)

    # Throw Grenade
    if Input.is_action_just_pressed(prefix + "bomb") and bombs > 0:
        throw_bomb()

func apply_gravity(delta: float) -> void:
    if not is_on_floor():
        velocity.y += gravity * delta
        current_state = State.JUMP if velocity.y < 0 else State.FALL
    elif current_state == State.FALL or current_state == State.JUMP:
        current_state = State.IDLE

func throw_bomb() -> void:
    bombs -= 1
    var bomb_scene = preload("res://scenes/weapons/Grenade.tscn")
    var bomb = bomb_scene.instantiate()
    bomb.global_position = global_position + Vector2(facing * 16, -15)
    bomb.launch(Vector2(facing * 340 + velocity.x * 0.3, -380))
    get_tree().current_scene.add_child(bomb)
`
  },
  {
    path: 'scripts/weapons/WeaponManager.gd',
    category: 'Player & Weapons',
    description: 'Resource-based modular weapon system (Pistol, HMG, Flame, Rocket, Shotgun, Laser).',
    code: `extends Node2D
class_name WeaponManager

enum WeaponType { PISTOL, HMG, FLAME, ROCKET, SHOTGUN, LASER }

@export var current_weapon: WeaponType = WeaponType.PISTOL
@export var ammo: int = 9999

var fire_timer: float = 0.0

const WEAPON_CONFIGS = {
    WeaponType.PISTOL: { "rate": 0.20, "damage": 12, "spread": 0.02, "pellets": 1 },
    WeaponType.HMG: { "rate": 0.085, "damage": 14, "spread": 0.08, "pellets": 1 },
    WeaponType.FLAME: { "rate": 0.06, "damage": 8, "spread": 0.35, "pellets": 3 },
    WeaponType.ROCKET: { "rate": 0.42, "damage": 65, "spread": 0.05, "pellets": 1 },
    WeaponType.SHOTGUN: { "rate": 0.65, "damage": 32, "spread": 0.28, "pellets": 6 },
    WeaponType.LASER: { "rate": 0.08, "damage": 18, "spread": 0.01, "pellets": 1 },
}

func _process(delta: float) -> void:
    if fire_timer > 0:
        fire_timer -= delta

func try_fire(aim_dir: Vector2, spawn_pos: Vector2) -> bool:
    if fire_timer > 0:
        return false

    var cfg = WEAPON_CONFIGS[current_weapon]
    fire_timer = cfg["rate"]

    for i in range(cfg["pellets"]):
        var spread = randf_range(-cfg["spread"], cfg["spread"])
        var shoot_dir = aim_dir.rotated(spread)
        spawn_projectile(shoot_dir, spawn_pos, cfg["damage"])

    if current_weapon != WeaponType.PISTOL:
        ammo -= 1
        if ammo <= 0:
            current_weapon = WeaponType.PISTOL
            ammo = 9999

    return true

func spawn_projectile(dir: Vector2, pos: Vector2, damage: int) -> void:
    var bullet_scene = preload("res://scenes/weapons/Bullet.tscn")
    var bullet = bullet_scene.instantiate()
    bullet.setup(dir, pos, damage, current_weapon)
    get_tree().current_scene.add_child(bullet)
`
  },
  {
    path: 'scripts/vehicles/IronSlugTank.gd',
    category: 'Vehicles',
    description: 'Pilotable armored tank: twin 360-degree vulcan cannons, 120mm heavy shells, and jump hydraulics.',
    code: `extends CharacterBody2D
class_name IronSlugTank

@export var max_armor: float = 100.0
@export var move_speed: float = 180.0
@export var cannon_cooldown: float = 0.9

@onready var turret_vulcan: Marker2D = $Turret/VulcanMuzzle
@onready var cannon_barrel: Marker2D = $Turret/CannonMuzzle

var current_armor: float = 100.0
var driver: IronPlayer = null
var is_occupied: bool = false
var facing: int = 1

func _physics_process(delta: float) -> void:
    if not is_occupied:
        velocity.x = 0
        velocity.y += 1200 * delta
        move_and_slide()
        return

    var prefix = "p%d_" % driver.player_id
    var move_x = Input.get_axis(prefix + "move_left", prefix + "move_right")
    velocity.x = move_x * move_speed
    velocity.y += 1200 * delta

    if move_x != 0:
        facing = 1 if move_x > 0 else -1
        scale.x = facing

    # Hydraulic Jump
    if Input.is_action_just_pressed(prefix + "jump") and is_on_floor():
        velocity.y = -450.0

    # Vulcan rapid fire
    if Input.is_action_pressed(prefix + "fire"):
        fire_vulcan()

    # 120mm Heavy Cannon Shell
    if Input.is_action_just_pressed(prefix + "bomb"):
        fire_heavy_cannon()

    # Dismount
    if Input.is_action_just_pressed(prefix + "mount"):
        eject_driver()

    move_and_slide()

func fire_heavy_cannon() -> void:
    var shell_scene = preload("res://scenes/weapons/CannonShell.tscn")
    var shell = shell_scene.instantiate()
    shell.global_position = cannon_barrel.global_position
    shell.launch(Vector2(facing * 750, 0))
    get_tree().current_scene.add_child(shell)
    # Screen shake trigger
    GlobalCamera.shake(16.0, 0.3)

func eject_driver() -> void:
    if driver:
        driver.global_position = global_position + Vector2(0, -40)
        driver.velocity.y = -400.0
        driver.current_state = IronPlayer.State.JUMP
        driver = null
        is_occupied = false
`
  },
  {
    path: 'scripts/bosses/BossGoliathColossus.gd',
    category: 'Boss & Enemies',
    description: 'Stage 1 Boss: Multi-stage cave colossus with homing missile salvos and plasma beam charges.',
    code: `extends Node2D
class_name BossGoliathColossus

signal boss_defeated

@export var max_health: float = 1200.0
var current_health: float = 1200.0
var phase: int = 1

@onready var left_missile_pod: Marker2D = $MissilePodL
@onready var right_missile_pod: Marker2D = $MissilePodR
@onready var mouth_laser_point: Marker2D = $MouthLaser
@onready var eyes_light: PointLight2D = $EyesLight

func _ready() -> void:
    start_combat_cycle()

func start_combat_cycle() -> void:
    var timer = get_tree().create_timer(2.5)
    await timer.timeout

    while current_health > 0:
        var hp_pct = current_health / max_health
        if hp_pct < 0.35:
            phase = 3
            eyes_light.color = Color("#ef4444")
            await launch_missile_salvo(6)
            await fire_plasma_beam()
        elif hp_pct < 0.70:
            phase = 2
            await fire_plasma_beam()
        else:
            phase = 1
            await launch_missile_salvo(4)

        await get_tree().create_timer(3.0).timeout

func launch_missile_salvo(count: int) -> void:
    for i in range(count):
        var pod = left_missile_pod if i % 2 == 0 else right_missile_pod
        var missile = preload("res://scenes/enemies/HomingMissile.tscn").instantiate()
        missile.global_position = pod.global_position
        get_tree().current_scene.add_child(missile)
        await get_tree().create_timer(0.2).timeout

func fire_plasma_beam() -> void:
    # Charge glowing particle FX
    mouth_laser_point.visible = true
    GlobalCamera.shake(12.0, 0.45)
    var beam = preload("res://scenes/enemies/PlasmaBeam.tscn").instantiate()
    beam.global_position = mouth_laser_point.global_position
    get_tree().current_scene.add_child(beam)
`
  },
  {
    path: 'scripts/fx/ParallaxGodRays.gd',
    category: 'World & FX',
    description: 'Ori-style volumetric god rays and dynamic 2D lighting compositor shader.',
    code: `shader_type canvas_item;

uniform vec4 ray_color : source_color = vec4(1.0, 0.95, 0.8, 0.18);
uniform float ray_speed = 0.5;
uniform float ray_density = 4.0;

void fragment() {
    vec2 uv = UV;
    float angle_uv = uv.x - uv.y * 0.45;
    float noise = sin(angle_uv * ray_density + TIME * ray_speed) * 0.5 + 0.5;
    float fade = (1.0 - uv.y) * 0.8;
    COLOR = ray_color * noise * fade;
}
`
  }
];
