/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class PendragonActor extends Actor {
  // TODO: ADDON: Introduce Lady & Creature sheets
  // TODO: ADDON: Implement Battle dialog
  // TODO: ADDON: Implement Winter-phase dialog
  // TODO: CORE: Refactor dice class, rolls should apply bonus to target

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

    this.migrate(actorData);

    this._prepareKnightData(actorData);
    this._prepareLadyData(actorData);
    this._prepareCreatureData(actorData);

    this._processDerrivatives(actorData);

    this.prunePassions(data);
    this.pruneSkills(data);
    this.pruneHoldings(data);
    this.pruneHistory(data);
  }

  migrate(data) {
    if(data["army"] && data.army["vassal_knights"] === undefined) {
      data.army.vassal_knights = 0
    }

    if(data["followers"] === undefined) {
      data.followers = {
        squire: {
          name: "",
          age: 15,
          first_aid: 0,
          battle: 0,
          horsemanship: 0,
          otherSkill: {name: "", value: 0}
        },
        warhorse: {
          name: "",
          damage: 1,
          move: 0,
          armor: 0,
          hp: 1,
          size: 10,
          constitution: 10,
          dexterity: 10
        },
        ridingHorses: {},
      }

    }

    for(let traitName in data.traits) {
      if(data.traits[traitName].leftReligious === undefined)
      {
        data.traits[traitName].leftReligious = false;
        data.traits[traitName].rightReligious = false;
      }
    }
  }

  hasReligiousBonus(data) {
    let count = 0;
    for(let traitName in data.traits)
    {
      if(data.traits[traitName].leftValue >= 16 && data.traits[traitName].leftReligious) {
        count++;
      }
      else if(data.traits[traitName].rightValue >= 16 && data.traits[traitName].rightReligious)
      {
        count++;
      }
    }

    return count === 5;
  }

  prunePassions(data) {
    for(const passion in data.passions)
    {
      if(data.passions[passion] == null)
      {
        delete data.passions[passion];
      }
    }
  }

  pruneSkills(data) {
    for(const otherSkill in data.skills.others)
    {
      if(data.skills.others[otherSkill] == null){
        delete data.skills.others[otherSkill];
      }
    }

    for(const combatSkill in data.skills.combat)
    {
      if(data.skills.combat[combatSkill] == null){
        delete data.skills.combat[combatSkill];
      }
    }
  }

  pruneHoldings(data) {
    for(const holding in data.holdings)
    {
      if(data.holdings[holding] == null)
      {
        delete data.holdings[holding];
      }
    }
  }

  pruneHistory(data) {
    for(const history in data.history)
    {
      if(data.history[history] == null)
      {
        delete data.history[history];
      }
    }
  }

  _processDerrivatives(actorData) {
    const data = actorData.data;

    data.damage = Math.max(1, Math.round( (data.statistics.strength.value + data.statistics.size.value) / 6 ));

    if(!data.healing_rate)
    {
      data.healing_rate = {};
    }

    if(this.hasReligiousBonus(data))
    {
      data.healing_rate.value = Math.max(1, Math.round( (data.statistics.strength.value + data.statistics.constitution.value) / 10 )) + 2;
    }
    else
    {
      data.healing_rate.value = Math.max(1, Math.round( (data.statistics.strength.value + data.statistics.constitution.value) / 10 ));
    }

    if(!data.move_rate)
    {
      data.move_rate = {};
    }
    data.move_rate.value = Math.max(1, Math.round( (data.statistics.strength.value + data.statistics.dexterity.value) / 10 ));

    data.hitPoints.max = (data.statistics.size.value + data.statistics.constitution.value)
    data.unconcious = Math.round(data.hitPoints.max / 4);

    data.initiative = data.move_rate.value;
    data.initiative_tiebreaker = data.statistics.dexterity.value / 10;
    data.composite_initiative = data.initiative + data.initiative_tiebreaker;
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

  static getSpeed(actor) {
    return (actor.data.data.statistics.strength.value + actor.data.data.statistics.dexterity.value) / 10.0;
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

  // _onUpdate(changed, options, userId) {
  //   super._onUpdate(changed, options, userId);
  //
  //   this.data.data.initiative = PendragonActor.getSpeed(this);
  //   console.log(this.data.data.initiative);
  // }
}