/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class pendragonActor extends Actor {
  //TODO: ADDON: Introduce Lady & Creature sheets
  //TODO: CORE: Implement Winter-phase dialog
  //TODO: ADDON: Implement Battle dialog
  //TODO: CORE: Add custom skill dialog, + button by headers?

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.pendragon52 || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareKnightData(actorData);
    this._prepareLadyData(actorData);
    this._prepareCreatureData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareKnightData(actorData) {
    if (actorData.type !== 'knight') return;

    const data = actorData.data;
  }

  _prepareLadyData(actorData) {
    if (actorData.type !== 'lady') return;

    const data = actorData.data;
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareCreatureData(actorData) {
    if (actorData.type !== 'creature') return;

    const data = actorData.data;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getKnightRollData(data);
    this._getLadyRollData(data);
    this._getCreatureRollData(data);

    return data;
  }

  _getKnightRollData(data) {
    if (this.data.type !== 'knight') return;
  }

  _getLadyRollData(data) {
    if (this.data.type !== 'lady') return;
  }

  _getCreatureRollData(data) {
    if (this.data.type !== 'creature') return;
  }

  async rollInitiative() {

  }
}