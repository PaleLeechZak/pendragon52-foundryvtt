export class PendragonDice {
    static digestResult(data, roll) {
        let result = {
            isSuccess: false,
            isFailure: false,
            isCritical: false,
            isFumble: false,
            target: roll.data.target,
            total: roll.terms[0].total,
        };

        console.log(data, roll);

        let die = roll.terms[0].total;


        if(roll.data.type == "check") {
            if(die <= roll.data.target && die !== 20) {
                if(die == roll.data.target) {
                    result.isCritical = true;
                } else {
                    result.isSuccess = true;
                }
            } else {
                if(die == 20) {
                    result.isFumble = true;
                } else {
                    result.isFailure = true;
                }
            }
        } else if(roll.data.type == "advancement") {
            if (die > roll.data.target || die === 20) {
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

        let templateData = {
            title,
            flavor,
            data
        };

        // Optionally include a situational bonus
        if (form !== null && form.bonus.value) {
            parts.push(form.bonus.value);
        }

        console.log(parts);
        console.log(parts.join("+"));
        const roll = new Roll(parts.join("+"), data).roll({async:false});

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
                    rolled = true
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