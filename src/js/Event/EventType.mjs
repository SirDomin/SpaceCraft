export class EventType {
    static MOVEMENT = 'movement';
    static GAME_TICK = 'gametick';
    static FPS_TICK = 'gametick';
    static PLAYER_CREATE = 'playercreate';
    static PLAYER_RENDER = 'playerrender';
    static PLAYER_UPDATE = 'playerupdate';
    static PLAYER_ROTATE = 'playerrotate';
    static RENDER_MINIMAP = 'renderminimap';
    static UPDATE_MINIMAP = 'updateminimap';
    static ACTIVATE_SLOT = 'activateslot';
    static OBJECT_CREATED = 'objectcreated';
    static REMOVE_OBJECT = 'removeobject';
    static VISIBLE_OBJECTS_TICK = 'visibleobjectstick';
    static ENEMY_DESTROYED = 'enemydestroyed';
    static PROJECTILE_HIT = 'projectilehit';
    static UI_ELEMENT_CREATE = 'uielementcreate';
    static TOGGLE_PAUSE = 'togglepause';
    static PROJECTILE_RENDER = 'projectilerender';
    static GAME_STATE_CHANGE = 'gamestatechange';
    static PLAYER_DESTROYED = 'playerdestroyed';

}
