export const addChatMessageButtons = function(msg, html, data) {
    // Hide blind rolls
    let blindable = html.find('.blindable');
    if (msg.data.blind && !game.user.isGM && blindable && blindable.data('blind') === true) {
        blindable.replaceWith("<div class='dice-roll'><div class='dice-result'><div class='dice-formula'>???</div></div></div>");
    }
    // Buttons
    let roll = html.find('.damage-roll');
    if (roll.length > 0) {
        let total = roll.find('.dice-total');
        let value = total.text();
        roll.append($(`<div class="dice-damage"><button type="button" data-action="apply-damage"><i class="fas fa-tint"></i></button></div>`))
        roll.find('button[data-action="apply-damage"]').click((ev) => {
            ev.preventDefault();
            applyChatCardDamage(roll, 1);
        })
    }
}