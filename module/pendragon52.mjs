// Import document classes.
import { PendragonActor } from "./documents/actor.mjs";
import { pendragonItem } from "./documents/item.mjs";
// Import sheet classes.
import { pendragonActorSheet } from "./sheets/actor-sheet.mjs";
import { pendragonItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { PENDRAGON52 } from "./helpers/config.mjs";
import * as chat from "./chat.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.pendragon52 = {
    pendragonActor: PendragonActor,
    pendragonItem
  };

  // Add custom constants for configuration.
  CONFIG.PENDRAGON52 = PENDRAGON52;

  CONFIG.Combat.initiative = {
    formula: "@initiative + (@statistics.dexterity.value / 10)",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = PendragonActor;
  CONFIG.Item.documentClass = pendragonItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pendragon52", pendragonActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("pendragon52", pendragonItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
});

Hooks.on("renderChatMessage", chat.addChatMessageButtons);