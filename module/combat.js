export class PendragonCombat {
    //TODO: CORE: Implement Initiative
    //TODO: CORE: Finish initiative tracker.

    //TODO: CORE: Initiative setting is blocked by getter only error, figure out wtf
    async rollInitiative(combat, data) {
        let retrievalList = [];
        let initiativeValues = {};
        combat.data.combatants.forEach((cbt) => {
            retrievalList.push(fromUuid(cbt.data.actorId));
            initiativeValues[cbt.data.actorId] = 0;
        });

        Promise.all(retrievalList).then((results) => {
            results.forEach((actor) => {
                initiativeValues[actor._id] = actor.getSpeed();
            });

            combat.data.combatants.forEach((cbt) => {
               cbt.initiative = initiativeValues[cbt.data.actorId];
            });

            combat.setupTurns();
        });
    }

    static addListeners(html) {
        html.find('.combat-control[data-control="reroll"]').click((ev) => {
            if (!game.combat) {
                return;
            }
            let data = {};
            FggCombat.rollInitiative(game.combat, data);
            game.combat.update({ data: data }).then(() => {
                game.combat.setupTurns();
            });
        });
    }

    static async setCombatantInitiative(combatant, data) {
        data.initiative = parseInt(Math.floor(combatant.actor.getSpeed()));
    }

    static createCombatant(combat, data, options, id) {
        console.log('Hello Created!');
        console.log(combat, data, options, id);
    }

    static updateCombatant(combatant, blah, data) {
        console.log('Hello Updated!', combatant);
        PendragonCombat.setCombatantInitiative(combatant, data);
    }

    static format(object, html, user) {
        PendragonCombat.addListeners(html);
    }
}