export class EventType {
    static MOVEMENT = 'movement';
    static GAME_TICK = 'gametick';
    static FPS_TICK = 'gametick';
    static PLAYER_CREATE = 'playercreate';
    static PLAYER_RENDER = 'playerrender';
    static PLAYER_UPDATE = 'playerupdate';
    static PLAYER_ROTATE = 'playerrotate';
    static RENDER_MINIMAP = 'renderminimap';
    static ACTIVATE_SLOT = 'activateslot';
    static OBJECT_CREATED = 'objectcreated';
    static REMOVE_OBJECT = 'removeobject';
    static VISIBLE_OBJECTS_TICK = 'visibleobjectstick';
    static ENEMY_DESTROYED = 'enemydestroyed';
    static PROJECTILE_HIT = 'projectilehit';
}
