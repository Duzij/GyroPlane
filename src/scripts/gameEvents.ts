import { TextSprite } from "@enable3d/three-graphics/jsm/flat";

export function showYouLoseText(scene2d: THREE.Scene) {
    const youLostSprite = scene2d.getObjectByName('youLostSprite') as TextSprite;
    youLostSprite.visible = true;
}
