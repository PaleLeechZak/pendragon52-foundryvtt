export class PendragonDice {
    static DiceTypes = {
        straight: 'straight',
        check: 'check',
        advancement: 'advancement',
    };

    static digestResult(data, roll) {
        let die = roll.terms[0].total;

        let target;

        if(data.targetModifier) {
            target = roll.data.target + data.targetModifier;
        }
        else {
            target = roll.data.target;
        }

        let result = {
            type: roll.data.type,
            isSuccess: false,
            isFailure: false,
            isCritical: false,
            isFumble: false,
            target,
            total: roll._total,
            dice: roll.terms[0].values,
            faces: roll.terms[0].faces,
            reason: roll.data.reason,
        };

        if(typeof(roll.terms[2]) === 'object' && roll.terms[2].faces) {
            die += roll.terms[2].total;
            result.dice = result.dice.concat(roll.terms[2].values);
        }

        console.log(result);


        if(roll.data.type === this.DiceTypes.check) {
            if(die <= target && die !== 20) {
                if(die === target || (target >= 20 && die === 19)) {
                    result.isCritical = true;
                } else {
                    result.isSuccess = true;
                }
            } else {
                if(die === 20) {
                    result.isFumble = true;
                } else {
                    result.isFailure = true;
                }
            }
        } else if(roll.data.type === this.DiceTypes.advancement) {
            if (die > target || die === 20) {
                result.isSuccess = true;
            } else {
                result.isFailure = true;
            }
        }

        return result;
    }

    static async sendRoll({
        parts = [],
        data = {},
        bonus = null,
        title = null,
        flavor = null,
        speaker = null,
        form = null,
    } = {}) {
        const template = "systems/pendragon52/templates/chat/roll-result.html";

        let chatData = {
          user: game.user.id,
          speaker: speaker
        };

        let rollData = data;

        if(bonus && data.type !== this.DiceTypes.straight) {
            rollData.targetModifier = bonus;
        } else if(bonus) {
            parts.push(bonus + 'd6');
        }

        let templateData = {
            title,
            flavor,
            data
        };

        const roll = new Roll(parts.join("+"), rollData).roll({async:false});

        // Convert the roll to a chat message and return the roll
        let rollMode = game.settings.get("core", "rollMode");
        rollMode = form ? form.rollMode.value : rollMode;

        // Force blind roll (ability formulas)
        if (data.roll.blindroll) {
            rollMode = game.user.isGM ? "selfroll" : "blindroll";
        }

        if (["gmroll", "blindroll"].includes(rollMode))
            chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
        if (rollMode === "selfroll") chatData["whisper"] = [game.user.id];
        if (rollMode === "blindroll") {
            chatData["blind"] = true;
            data.roll.blindroll = true;
        }

        templateData.result = PendragonDice.digestResult(data, roll);

        return new Promise((resolve) => {
            roll.render().then((rollResult) => {
                templateData.rollPendragon = rollResult;
                renderTemplate(template, templateData).then((content) => {
                    chatData.content = content;
                    chatData.sound = CONFIG.sounds.dice;
                    ChatMessage.create(chatData);
                    resolve(roll);
                });
            });
        });
    }

    static async Roll({
        parts = [],
        data = {},
        speaker = null,
        flavor = null,
        title = null,
    } = {}) {
        let rolled = false;
        const template = "systems/pendragon52/templates/chat/roll-dialog.html";
        let dialogData = {
            formula: parts.join(" "),
            data: data,
            rollMode: game.settings.get("core", "rollMode"),
            rollModes: CONFIG.Dice.rollModes,
        };

        let rollData = {
            parts,
            data,
            title,
            flavor,
            speaker,
        };

        let buttons = {
            ok: {
                label: game.i18n.localize("Pendragon.Dialog.Roll"),
                icon: '<i class="fas fa-dice-d20"></i>',
                callback: (html) => {
                    const bonus = Number.parseInt(html.find('[name="bonus"]').val());
                    rolled = true
                    rollData.bonus = bonus;
                    roll = PendragonDice.sendRoll(rollData);
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("Pendragon.Dialog.Cancel"),
                callback: (html) => { },
            }
        }

        const html = await renderTemplate(template, dialogData);
        let roll;

        return new Promise((resolve) => {
            new Dialog({
                title: title,
                content: html,
                buttons: buttons,
                default: "ok",
                close: () => {
                    resolve(rolled ? roll : false);
                },
            }).render(true);
        });
    }
}