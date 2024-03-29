const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const authorize = require("../utils/google/googleAuthorize");
const getTargetCell = require("../utils/getTargetCell");
const getFailedChallenges = require("../utils/getFailedChallenges");

const sheetStartingDate = new Date(
  `${process.env.SHEET_STARING_DATE} 00:00:00`
);

const voyelArray = ["a", "e", "i", "o", "u"];

const totalFailEmbed = (interaction, totalFails) => {
  return new EmbedBuilder()
    .setColor("#dfeefc")
    .setAuthor({
      name: `Voici le nombre total de fails ${
        voyelArray.includes(
          interaction.options.getString("name")[0].toLowerCase()
        )
          ? "d'"
          : "de "
      }${interaction.options.getString("name")} !`,
      iconURL: `https://media.istockphoto.com/id/538335769/fr/photo/beignet-avec-confettis-en-sucre-isol%C3%A9.jpg?s=612x612&w=0&k=20&c=5ABjKAsyFwFNflL6BhabjmsRod2X5ZZVMBpohEjh304=`,
      url: "https://docs.google.com/spreadsheets/d/1_9VKhiAp9E4STmI9wpgV3mRElIXjzxhKiF9BlIiGNWM",
    })
    .setDescription(
      `${interaction.options.getString("name")} a perdu ${
        totalFails === 0
          ? interaction.options.getString("name") != "Amandine"
            ? "0 fois, quel boss !"
            : "0 fois, quelle bosse !"
          : `${totalFails} fois, dommage, le Henri Challenge fait vraiment des ravages...`
      }`
    );
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("totalfails")
    .setDescription("Donne le total de fail par personne !")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the student")
        .setRequired(true)
        .addChoices(
          { name: "Henri", value: "Henri" },
          { name: "Pierre", value: "Pierre" },
          { name: "Amandine", value: "Amandine" },
          { name: "Hugo", value: "Hugo" },
          { name: "Mathys", value: "Mathys" },
        )
    )
    .setDMPermission(false),
  aliases: ["fails"],
  async execute({ client: client, interaction: interaction }) {
    const auth = await authorize();
    const targetCell = getTargetCell(interaction);
    const daysDifference = Math.floor(
      (new Date() - sheetStartingDate) / 86400000
    );
    
    const totalFailsObject = await getFailedChallenges(
      auth,
      targetCell,
      daysDifference
    ).catch(console.error);

    const totalFails = Object.values(totalFailsObject).reduce(
      (a, b) => a + b,
      0
    );

    return interaction.reply({
      embeds: [totalFailEmbed(interaction, totalFails)],
    });
  },
};
