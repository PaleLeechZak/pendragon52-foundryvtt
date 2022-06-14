export class PendragonCombat {
    //TODO: CORE: Implement Initiative
    //TODO: CORE: Finish initiative tracker.
    rollInitiative(combat, data) {
        combat.data.combatants.forEach((cbt) => {
            cbt.initiative = cbt.actor.data
        });
    }

    preCreatCombatant(combat, data, options, id) {

    }

    updateCombatant(combat, combatant, data) {

    }

    format(object, html, user) {

    }
}