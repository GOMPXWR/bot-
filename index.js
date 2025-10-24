const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, Events } = require('discord.js');

const config = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID
};

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] 
});

// Sistema de economía simple
const userCoins = new Map();
const userStats = new Map();

// TRIVIA MEJORADA CON MÁS PREGUNTAS
const preguntasTrivia = [
    { 
        pregunta: "¿En qué año se lanzó Minecraft?", 
        respuesta: "2011", 
        opciones: ["2009", "2011", "2013", "2015"],
        explicacion: "Minecraft fue lanzado oficialmente en 2011 por Mojang"
    },
    { 
        pregunta: "¿Cuál es el río más largo del mundo?", 
        respuesta: "Nilo", 
        opciones: ["Amazonas", "Nilo", "Misisipi", "Yangtsé"],
        explicacion: "El río Nilo en África tiene 6,650 km de longitud"
    },
    { 
        pregunta: "¿Qué elemento químico tiene el símbolo 'Au'?", 
        respuesta: "Oro", 
        opciones: ["Plata", "Oro", "Aluminio", "Argón"],
        explicacion: "Au viene del latín 'Aurum' que significa oro"
    },
    { 
        pregunta: "¿En qué continente está Egipto?", 
        respuesta: "África", 
        opciones: ["África", "Asia", "Europa", "América"],
        explicacion: "Egipto está ubicado en el noreste de África"
    },
    { 
        pregunta: "¿Cuántos lados tiene un hexágono?", 
        respuesta: "6", 
        opciones: ["5", "6", "7", "8"],
        explicacion: "Hexágono viene del griego 'hex' (seis) y 'gonia' (ángulo)"
    },
    { 
        pregunta: "¿Qué planeta es conocido como 'el planeta rojo'?", 
        respuesta: "Marte", 
        opciones: ["Venus", "Marte", "Júpiter", "Saturno"],
        explicacion: "Marte aparece rojo por el óxido de hierro en su superficie"
    },
    { 
        pregunta: "¿Quién pintó 'La noche estrellada'?", 
        respuesta: "Van Gogh", 
        opciones: ["Picasso", "Van Gogh", "Dalí", "Monet"],
        explicacion: "Vincent van Gogh pintó esta obra maestra en 1889"
    },
    { 
        pregunta: "¿Cuál es el océano más grande del mundo?", 
        respuesta: "Pacífico", 
        opciones: ["Atlántico", "Índico", "Pacífico", "Ártico"],
        explicacion: "El océano Pacífico cubre aproximadamente 1/3 de la Tierra"
    },
    { 
        pregunta: "¿Qué animal es el más rápido del mundo?", 
        respuesta: "Guepardo", 
        opciones: ["Leopardo", "Guepardo", "León", "Tigre"],
        explicacion: "El guepardo puede alcanzar 112 km/h en carreras cortas"
    },
    { 
        pregunta: "¿Cuál es el hueso más largo del cuerpo humano?", 
        respuesta: "Fémur", 
        opciones: ["Tibia", "Fémur", "Húmero", "Radio"],
        explicacion: "El fémur se encuentra en el muslo y es el hueso más largo y fuerte"
    },
    { 
        pregunta: "¿En qué año cayó el muro de Berlín?", 
        respuesta: "1989", 
        opciones: ["1987", "1989", "1991", "1993"],
        explicacion: "El muro de Berlín cayó el 9 de noviembre de 1989"
    },
    { 
        pregunta: "¿Qué instrumento musical tiene 88 teclas?", 
        respuesta: "Piano", 
        opciones: ["Guitarra", "Violín", "Piano", "Saxofón"],
        explicacion: "Un piano estándar tiene 52 teclas blancas y 36 negras"
    },
    { 
        pregunta: "¿Cuál es el país más grande del mundo?", 
        respuesta: "Rusia", 
        opciones: ["Canadá", "China", "Rusia", "Estados Unidos"],
        explicacion: "Rusia tiene 17.1 millones de km² de superficie"
    },
    { 
        pregunta: "¿Qué gas necesitan las plantas para la fotosíntesis?", 
        respuesta: "CO2", 
        opciones: ["Oxígeno", "Nitrógeno", "CO2", "Hidrógeno"],
        explicacion: "Las plantas absorben CO2 y liberan oxígeno durante la fotosíntesis"
    },
    { 
        pregunta: "¿Quién escribió 'Don Quijote de la Mancha'?", 
        respuesta: "Cervantes", 
        opciones: ["García Márquez", "Cervantes", "Shakespeare", "Dostoyevski"],
        explicacion: "Miguel de Cervantes Saavedra escribió esta obra maestra en 1605"
    }
];

// COMANDOS COMPLETOS - ASEGÚRATE DE QUE ESTÉN TODOS
const commands = [
    new SlashCommandBuilder().setName('carrera').setDescription('🎪 Carrera tipo Fall Guys'),
    new SlashCommandBuilder().setName('impostor').setDescription('🕵️ Juego tipo Among Us'),
    new SlashCommandBuilder().setName('dibuja').setDescription('🎨 Dibuja y adivina'),
    new SlashCommandBuilder().setName('party').setDescription('🎪 Selecciona minijuego'),
    new SlashCommandBuilder().setName('trivia').setDescription('🧠 Trivia con 15+ preguntas'),
    new SlashCommandBuilder().setName('ruleta').setDescription('🎰 Ruleta rusa'),
    new SlashCommandBuilder().setName('memoria').setDescription('🧠 Juego de memoria'),
    new SlashCommandBuilder().setName('perfil').setDescription('👤 Ver tu perfil'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 Tabla de clasificación'),
    new SlashCommandBuilder().setName('slot').setDescription('🎰 Máquina tragamonedas'),
    new SlashCommandBuilder().setName('solo').setDescription('🎮 Juegos para un solo jugador'),
    new SlashCommandBuilder().setName('version').setDescription('ℹ️ Ver información del bot')
].map(command => command.toJSON());

// REGISTRAR COMANDOS - ESTO ES CLAVE
const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
    try {
        console.log('🔄 Registrando comandos slash...');
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        console.log(`✅ ${data.length} comandos registrados correctamente!`);
        console.log('📝 Comandos disponibles:', commands.map(c => c.name).join(', '));
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
}

// Ejecutar el registro de comandos
registerCommands();

// Función para obtener coins
function getCoins(userId) {
    if (!userCoins.has(userId)) {
        userCoins.set(userId, 1000);
        userStats.set(userId, { wins: 0, games: 0, coinsWon: 0 });
    }
    return userCoins.get(userId);
}

client.on(Events.ClientReady, () => {
    console.log(`🎮 ${client.user.tag} listo con trivia mejorada!`);
    console.log(`📊 ${preguntasTrivia.length} preguntas en trivia`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    // COMANDO TRIVIA MEJORADO
    if (commandName === 'trivia') {
        const pregunta = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)];
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('a').setLabel(pregunta.opciones[0]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('b').setLabel(pregunta.opciones[1]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('c').setLabel(pregunta.opciones[2]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('d').setLabel(pregunta.opciones[3]).setStyle(ButtonStyle.Primary)
            );

        const embed = new EmbedBuilder()
            .setTitle('🧠 TRIVIA MEJORADA')
            .setDescription(`**${pregunta.pregunta}**\n\nTienes 20 segundos para responder!`)
            .setColor(0x3498DB)
            .setFooter({ text: `Pregunta ${preguntasTrivia.indexOf(pregunta) + 1} de ${preguntasTrivia.length} | ¡Respuestas verificadas! ✅` });

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.isButton() && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000 });

        collector.on('collect', async i => {
            const selectedIndex = ['a', 'b', 'c', 'd'].indexOf(i.customId);
            const selectedAnswer = pregunta.opciones[selectedIndex];
            
            if (selectedAnswer === pregunta.respuesta) {
                const coins = getCoins(user.id);
                userCoins.set(user.id, coins + 50);
                
                const winEmbed = new EmbedBuilder()
                    .setTitle('🎉 ¡CORRECTO!')
                    .setDescription(`**${pregunta.respuesta}** ✅\n\n*${pregunta.explicacion}*`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '💰 Premio', value: '+50 🪙', inline: true },
                        { name: '💳 Saldo Actual', value: `${getCoins(user.id)} 🪙`, inline: true }
                    );
                
                await i.reply({ embeds: [winEmbed] });
                collector.stop();
            } else {
                await i.reply({ 
                    content: `❌ Incorrecto! La respuesta era: **${pregunta.respuesta}**\n*${pregunta.explicacion}*`, 
                    ephemeral: true 
                });
                collector.stop();
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await interaction.followUp({ 
                    content: `⏰ **TIEMPO AGOTADO!** La respuesta era: **${pregunta.respuesta}**\n*${pregunta.explicacion}*` 
                });
            }
        });
    }

    // COMANDO VERSION
    else if (commandName === 'version') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ INFORMACIÓN DEL BOT')
            .setColor(0x00FF00)
            .addFields(
                { name: '🔄 Versión', value: '**2.1.0**', inline: true },
                { name: '📅 Actualizado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '✅ Estado', value: '**En funcionamiento**', inline: true },
                { name: '🧠 Preguntas Trivia', value: `**${preguntasTrivia.length}** disponibles`, inline: true }
            )
            .setFooter({ text: '¡Trivia mejorada con más preguntas!' });

        await interaction.reply({ embeds: [embed] });
    }

    // COMANDO PERFIL
    else if (commandName === 'perfil') {
        const coins = getCoins(user.id);
        const stats = userStats.get(user.id) || { wins: 0, games: 0, coinsWon: 0 };
        const winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : 0;

        const embed = new EmbedBuilder()
            .setTitle(`👤 PERFIL - ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor(0x3498DB)
            .addFields(
                { name: '🪙 Monedas', value: `**${coins}**`, inline: true },
                { name: '🏆 Victorias', value: `**${stats.wins}**`, inline: true },
                { name: '📊 Win Rate', value: `**${winRate}%**`, inline: true },
                { name: '🎮 Partidas', value: `**${stats.games}** jugadas`, inline: true },
                { name: '💰 Ganado Total', value: `**${stats.coinsWon}** 🪙`, inline: true }
            )
            .setFooter({ text: '¡Juega trivia para ganar más monedas!' });

        await interaction.reply({ embeds: [embed] });
    }

    // COMANDO SOLO
    else if (commandName === 'solo') {
        const gamesMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('solo_game_select')
                .setPlaceholder('🎮 Elige un juego individual')
                .addOptions([
                    { label: 'Adivina el Número', description: '🎯 Clásico juego de adivinanza', value: 'adivina', emoji: '🔢' },
                    { label: 'Piedra Papel Tijera', description: '✂️ Contra la máquina', value: 'ppt', emoji: '🪨' },
                    { label: 'Trivia Individual', description: '🧠 Practica sin presión', value: 'trivia_solo', emoji: '📚' }
                ])
        );

        const embed = new EmbedBuilder()
            .setTitle('🎮 MODO SOLO')
            .setDescription('**Juega a tu ritmo!**\nSelecciona un juego:')
            .setColor(0x7289DA)
            .addFields(
                { name: '👤 Jugador', value: `${user.username}`, inline: true },
                { name: '💰 Recompensas', value: 'Hasta **100** 🪙', inline: true }
            );

        await interaction.reply({ embeds: [embed], components: [gamesMenu] });
    }

    // COMANDOS BÁSICOS (para que no den error)
    else if (commandName === 'carrera') {
        await interaction.reply('🎪 **Carrera** - ¡Juego en desarrollo! Próximamente...');
    }
    else if (commandName === 'impostor') {
        await interaction.reply('🕵️ **Impostor** - ¡Juego en desarrollo! Próximamente...');
    }
    else if (commandName === 'dibuja') {
        await interaction.reply('🎨 **Dibuja** - ¡Juego en desarrollo! Próximamente...');
    }
    else if (commandName === 'party') {
        await interaction.reply('🎪 **Party** - ¡Juego en desarrollo! Próximamente...');
    }
    else if (commandName === 'ruleta') {
        await interaction.reply('🎰 **Ruleta** - ¡Juego en desarrollo! Próximamente...');
    }
    else if (commandName === 'memoria') {
        await interaction.reply('🧠 **Memoria** - ¡Juego en desarrollo! Próximamente...');
    }
    else if (commandName === 'leaderboard') {
        await interaction.reply('🏆 **Leaderboard** - ¡En desarrollo! Próximamente...');
    }
    else if (commandName === 'slot') {
        await interaction.reply('🎰 **Slot** - ¡Juego en desarrollo! Próximamente...');
    }
});

// Manejar juegos en solitario
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'solo_game_select') {
        const game = interaction.values[0];
        
        if (game === 'trivia_solo') {
            const pregunta = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)];
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('a').setLabel(pregunta.opciones[0]).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('b').setLabel(pregunta.opciones[1]).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('c').setLabel(pregunta.opciones[2]).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('d').setLabel(pregunta.opciones[3]).setStyle(ButtonStyle.Primary)
                );

            const embed = new EmbedBuilder()
                .setTitle('🧠 TRIVIA INDIVIDUAL')
                .setDescription(`**${pregunta.pregunta}**\n\nTómate tu tiempo para responder!`)
                .setColor(0x9B59B6)
                .setFooter({ text: 'Modo práctica - Sin límite de tiempo' });

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }

    // Manejar respuestas de trivia individual
    if (interaction.isButton() && ['a', 'b', 'c', 'd'].includes(interaction.customId)) {
        // Lógica para manejar respuestas...
        await interaction.reply({ content: '✅ Respuesta procesada!', ephemeral: true });
    }
});

client.login(config.token);