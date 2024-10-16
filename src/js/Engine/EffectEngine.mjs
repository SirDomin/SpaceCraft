import {EntityTypes} from "../Game/Object/EntityTypes.mjs";
import {EventType} from "../Event/EventType.mjs";
import {ExplosionEffect} from "../Game/Effect/ExplosionEffect.mjs";
import {ElectricEffect} from "../Game/Effect/ElectricEffect.mjs";
import {VoidRiftEffect} from "../Game/Effect/VoidRiftEffect.mjs";
import {AcidSplashEffect} from "../Game/Effect/AcidSplashEffect.mjs";

export class EffectEngine {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

    }

    applyExplosionEffect(x, y, projectile) {
        const enemies = this.gameEngine.getObjectsByType(EntityTypes.ENEMY);
        const radius = projectile.effectRadius;
        const damagePercentage = projectile.effectParams.damagePercentage || 50;

        const maxDamage = (projectile.damage * damagePercentage) / 100;
        const maxForce = projectile.effectParams.force || 10;

        enemies.forEach(enemy => {
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const distance = Math.hypot(enemyCenterX - x, enemyCenterY - y);

            if (distance <= radius) {
                const damageFactor = 1 - (distance / radius);

                const damage = maxDamage * damageFactor;
                const force = maxForce * damageFactor;

                enemy.onCollision({
                    damage: damage,
                    type: EntityTypes.EXPLOSION,
                    x: x,
                    y: y,
                    force: force,
                });
            }
        });

        const explosionEffect = new ExplosionEffect(x, y, radius);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, explosionEffect);
    }

    applyElectronicChargeEffect(x, y, projectile) {
        const enemies = this.gameEngine.getObjectsByType(EntityTypes.ENEMY);
        const radius = projectile.effectRadius;
        const slowPercentage = projectile.effectParams.slowPercentage || 20;
        const duration = projectile.effectParams.duration || 5;

        enemies.forEach(enemy => {
            const distance = Math.hypot(enemy.x + enemy.width / 2 - x, enemy.y + enemy.height / 2 - y);
            if (distance <= radius) {
                enemy.applyStatusEffect('slow', {
                    percentage: slowPercentage,
                    duration: duration,
                });
            }
        });

        const electricEffect = new ElectricEffect(x, y, radius);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, electricEffect);
    }

    applyAcidSplashEffect(x, y, projectile) {
        const enemies = this.gameEngine.getObjectsByType(EntityTypes.ENEMY);
        const radius = projectile.effectRadius;
        const damageOverTime = projectile.effectParams.damageOverTime || 10;
        const duration = projectile.effectParams.duration || 5;

        enemies.forEach(enemy => {
            const distance = Math.hypot(
                enemy.x + enemy.width / 2 - x,
                enemy.y + enemy.height / 2 - y
            );
            if (distance <= radius) {
                enemy.applyStatusEffect('acid', {
                    damageOverTime: damageOverTime,
                    duration: duration,
                });
            }
        });

        const acidEffect = new AcidSplashEffect(x, y, radius);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, acidEffect);
    }

    applyVoidRiftEffect(x, y, projectile) {
        const enemies = this.gameEngine.getObjectsByType(EntityTypes.ENEMY);
        const radius = projectile.effectRadius;
        const slowPercentage = projectile.effectParams.slowPercentage || 50;
        const duration = projectile.effectParams.duration || 3;

        enemies.forEach(enemy => {
            const distance = Math.hypot(
                enemy.x + enemy.width / 2 - x,
                enemy.y + enemy.height / 2 - y
            );
            if (distance <= radius) {
                enemy.applyStatusEffect('void_rift', {
                    percentage: slowPercentage,
                    duration: duration,
                    radius: radius,
                    x: x,
                    y: y,
                });
            }
        });

        const voidRiftEffect = new VoidRiftEffect(x, y, radius);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, voidRiftEffect);
    }

}