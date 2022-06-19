import {PendragonDice} from "../dice.js";
import {LocalizationUtility} from "../helpers/localization.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class pendragonActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["pendragon52", "sheet", "actor"],
      template: "systems/pendragon52/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/pendragon52/templates/actor/actor-${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'knight' || actorData.type == 'lady') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'creature') {
      //  Do nothing, items are not a big component of Pendragon, especially not on NPCs
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle localization cache for statistics.
    for (let [k, v] of Object.entries(context.data.statistics)) {
      v.label = game.i18n.localize(CONFIG.PENDRAGON52.statistics[k]) ?? k;
    }

    // Handle localization cache for combat skills.
    for (let [k, v] of Object.entries(context.data.skills.combat)) {
      if(v === null) continue;
      v.label = game.i18n.localize(CONFIG.PENDRAGON52.combatSkills[k]) ?? k;
    }

    // Handle localization cache for other skills.
    for (let [k, v] of Object.entries(context.data.skills.others)) {
      if(v === null) continue;
      v.label = game.i18n.localize(CONFIG.PENDRAGON52.otherSkills[k]) ?? k;
    }

    // Handle localization cache for traits.
    for (let [k, v] of Object.entries(context.data.traits)) {
      if(v === null) continue;
      v.leftLabel = game.i18n.localize(CONFIG.PENDRAGON52.traits[v.leftName]) ?? k;
      v.rightLabel = game.i18n.localize(CONFIG.PENDRAGON52.traits[v.rightName]) ?? k;
    }

    for (let [k, v] of Object.entries(context.data.gloryRewards)) {
      if(v === null) continue;
      v.label = game.i18n.localize(CONFIG.PENDRAGON52.gloryRewards[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.data.equipment.funds)) {
      if(v === null) continue;
      v.label = game.i18n.localize(CONFIG.PENDRAGON52.funds[k]) ?? k;
    }

    for (let [k, v] of Object.entries(context.data.equipment.gear_sets)) {
      if(v === null) continue;
      v.label = game.i18n.localize(CONFIG.PENDRAGON52.gear_sets[k]) ?? k;
    }

    LocalizationUtility.massLabel(context.data.passions, CONFIG.PENDRAGON52.passions);
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
   }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.skill-create').click(this._onAddSkill.bind(this));
    html.find('.skill-delete').click(this._onDeleteSkill.bind(this));
    html.find('.history-create').click(this._onAddHistory.bind(this));
    html.find('.history-delete').click(this._onDeleteHistory.bind(this));
    html.find('.holdings-create').click(this._onAddHolding.bind(this));
    html.find('.holdings-delete').click(this._onDeleteHolding.bind(this));
    html.find('.horse-create').click(this._onAddHorse.bind(this));
    html.find('.horse-delete').click(this._onDeleteHorse.bind(this));
    html.find('.passion-create').click(this._onAddPassion.bind(this));
    html.find('.passion-delete').click(this._onDeletePassion.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onAddHorse(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let updateData = {};
    updateData[`data.followers.ridingHorses.horse_${Object.entries(this.actor.data.data.followers.ridingHorses).length + 1}`] = {
      name: "",
      move: "",
    }
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onDeleteHorse(event){
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let updateData = {};
    updateData[`data.followers.ridingHorses.${dataset["horse"]}`] = null;
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onAddHistory(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log(dataset);

    let updateData = {};
    updateData[`data.history.history_${Object.entries(this.actor.data.data.history).length + 1}`] = {
      "year": 0,
      "description": "",
      "glory": 0
    };
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onDeleteHistory(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log(dataset);

    let updateData = {};
    updateData[`data.history.${dataset.history}`] = null;
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onAddHolding(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log(dataset);

    let updateData = {};
    updateData[`data.holdings.holding_${Object.entries(this.actor.data.data.holdings).length + 1}`] = {
      "name": "",
      "glory": 0
    };
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onDeleteHolding(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log(dataset);
    let updateData = {};
    updateData[`data.holdings.${dataset.holding}`] = null;
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onAddPassion(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let updateData = {};
    updateData[`data.passions.passion_${Object.entries(this.actor.data.data.passions).length}`] = {value: 0, name: "", type: "", custom: true}
    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  _onDeletePassion(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let updateData = {};
    updateData[`data.passions.${dataset.passion}`] = null;

    if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    //TODO: Refactor reasons to use pre-localized label fields
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log('Rolling?', dataset);
    if(dataset['stat'] !== undefined) {
      this.RollCheck(this.actor.data.data.statistics[dataset['stat']].value, dataset['stat']);
    } else if(dataset['combatskill'] !== undefined) {
      this.RollCheck(this.actor.data.data.skills.combat[dataset['combatskill']].value, dataset['combatskill']);
    } else if(dataset['otherskill'] !== undefined) {
      this.RollCheck(this.actor.data.data.skills.others[dataset['otherskill']].value, dataset['otherskill']);
    } else if(dataset['lefttrait']) {
      this.RollCheck(this.actor.data.data.traits[dataset['lefttrait']].leftAmount, dataset['lefttrait']);
    } else if(dataset['righttrait']) {
      this.RollCheck(this.actor.data.data.traits[dataset['righttrait']].rightAmount, dataset['righttrait']);
    } else if(dataset['damagedice']) {
      this.RollDamage(dataset['damagedice'], 'Damage');
    } else if(dataset['warhorse']){
      this.RollCheck(this.actor.data.data.followers.warhorse[dataset['warhorse']], 'Warhorse ' + dataset['warhorse']);
    } else if(dataset['warhorse_damage']){
      this.RollDamage(dataset['warhorse_damage'], 'Warhorse Damage');
    } else if(dataset['squireskill']){
      if(dataset['squireskill'] === 'otherSkill') {
        this.RollCheck(this.actor.data.data.followers.squire[dataset['squireskill']].value, 'Squire Skill ' + this.actor.data.data.followers.squire[dataset['squireskill']].name);
      } else {
        this.RollCheck(this.actor.data.data.followers.squire[dataset['squireskill']], 'Squire Skill ' + dataset['squireskill']);
      }
    } else if(dataset['passion']) {
      this.RollCheck(this.actor.data.data.passions[dataset['passion']].value, dataset['passion']);
    }
  }

  _onDeleteSkill(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if(dataset['deletecombatskill'] !== undefined){
      let updateData = {};
      updateData[`data.skills.combat.${dataset['skill']}`] = null;
      if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
    } else if(dataset['deletenoncombatskill'] !== undefined){
      let updateData = {};
      updateData[`data.skills.others.${dataset['skill']}`] = null;
      if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData);
    }
  }

  _onAddSkill(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log('Test...', dataset);

    if(dataset['addcombatskill'] !== undefined){
      let updateData = {};
      updateData[`data.skills.combat.skill_${Object.entries(this.actor.data.data.skills.combat).length + 1}`] = {
        value: 0,
        type: '',
        name: '',
        custom: true,
        advancement: false
      }
      if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData).then(() => { console.log('Done?') });
    } else if(dataset['addnoncombatskill'] !== undefined){
      let updateData = {};
      updateData[`data.skills.others.skill_${Object.entries(this.actor.data.data.skills.others).length + 1}`] = {
        value: 0,
        type: '',
        name: '',
        custom: true,
        advancement: false
      }
      if(this.actor.testUserPermission(game.user, "OWNER")) this.actor.update(updateData).then(() => { console.log('Done?') });
    }
  }

  RollDamage(amount, reason) {
    PendragonDice.Roll({
      parts: [amount + "d6"],
      speaker: {actor: this.actor.id},
      data:{
        type: "straight",
        target: 0,
        roll: {blindroll: false},
        reason,
      }
    });
  }

  RollCheck(target, reason) {
    console.log(target, reason);
    PendragonDice.Roll({
      parts: ["1d20"],
      speaker: {actor: this.actor.id},
      data:{
        type: "check",

        target,
        roll: {blindroll: false},
        reason,
      }});
  }

  //TODO: CORE: Implement Winter Phase
  RollAdvancement(target, reason) {
    PendragonDice.Roll({
      parts: ["1d20"],
      speaker: {actor: this.actor.id},
      data:{
        type: "advancement",
        target,
        roll: {blindroll: false},
        reason,
      }});
  }
}
