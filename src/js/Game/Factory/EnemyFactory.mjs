import {Enemy} from "../Object/Enemy.mjs";
import {Utils} from "../../Utils/Utils.mjs";

export class EnemyFactory {
    static createRandomEnemy() {
        let enemyTypes = loader.getResource('enemies').data.map(enemy => {
            return enemy.type
        });

        return EnemyFactory.createEnemy(Utils.getRandomElement(enemyTypes));
    }

    static createEnemy(enemyType) {
        const config = loader.getResourceBy('enemies', 'type', enemyType)

        const { type, health, speed, force, mechanics } = config;

        const enemy = new Enemy(0, 0, 50, 50, health);

        enemy.baseSpeed = speed;
        enemy.maxSpeed = speed;
        enemy.force = force;

        if (mechanics.shooting) {
            enemy.enableShooting();
        }
        if (mechanics.exploding) {
            enemy.enableExplosion();
        }
        if (mechanics.replication) {
            enemy.enableReplication();
        }

        switch (mechanics.shootingType) {
            case 'spread_shot':
                enemy.enableSpreadShot(mechanics.spreadCount, mechanics.spreadAngle, mechanics.shootInterval, mechanics.projectileSpeed);
                break;
            case 'burst_shot':
                enemy.enableBurstShot(mechanics.burstCount, mechanics.burstDelay, mechanics.shootInterval, mechanics.projectileSpeed);
                break;
            case 'homing_missile':
                enemy.enableHomingShot(mechanics.shootInterval, mechanics.homingSpeed);
                break;
            case 'explosive_shot':
                enemy.enableExplosiveShot(mechanics.shootInterval, mechanics.explosionRadius, mechanics.explosionDamage, mechanics.projectileSpeed);
                break;
        }

        return enemy;
    }
}
