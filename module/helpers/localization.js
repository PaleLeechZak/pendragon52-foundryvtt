export const LocalizationUtility = {
    massLabel(table, localizationTable) {
        for (let [k, v] of Object.entries(table))
        {
            v.label = game.i18n.localize(localizationTable[k]) ?? k;
        }
    },

    massLabelFields(table, resultFields, dataFields, localizationTable)
    {
        console.assert(resultFields.length == dataFields.length, 'Different length tables used for mass labeling fields.');
        for (let [k, v] of Object.entries(table))
        {
            for(let i = 0; i < resultFields.length; i++)
            {
                v[resultFields[i]] = game.i18n.localize(localizationTable[v[dataFields[i]]]) ?? k;
            }
        }
    }
};

