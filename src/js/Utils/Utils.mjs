export class Utils {
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static randomColor() {
        return 'rgb(xxx, xxx, xxx)'.replace(/xxx/g, char => {
            return this.random(0, 255);
        })
    }

    static distance(object1, object2) {
        const object1MidPoint = object1.getMidPoint();
        const object2MidPoint = object2.getMidPoint();

        return Math.sqrt(
            Math.pow(object1MidPoint.x - object2MidPoint.y, 2) +
            Math.pow(object1MidPoint.y - object2MidPoint.y, 2)
        );
    }

    static generateId = () => {
        return 'xxxxxxxxx'.replace(/[x]/g, char => {
            return Utils.random(0,9);
        })
    }
}