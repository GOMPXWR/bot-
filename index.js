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

const userData = new Map();

const cosmeticos = {
    marcos: [
        { id: 'default', name: '🖼️ Marco Básico', precio: 0 },
        { id: 'gold', name: '🌟 Marco Dorado', precio: 500 },
        { id: 'fire', name: '🔥 Marco de Fuego', precio: 800 },
        { id: 'ice', name: '❄️ Marco de Hielo', precio: 800 },
        { id: 'rainbow', name: '🌈 Marco Arcoíris', precio: 1200 }
    ],
    títulos: [
        { id: 'default', name: '👤 Novato', precio: 0 },
        { id: 'pro', name: '🎯 Experto', precio: 300 },
        { id: 'legend', name: '🏆 Leyenda', precio: 1000 },
        { id: 'rich', name: '💰 Millonario', precio: 2000 },
        { id: 'king', name: '👑 Rey del Casino', precio: 5000 }
    ],
    badges: [
        { id: 'gamer', name: '🎮 Jugador Activo', precio: 0, requisito: 10 },
        { id: 'winner', name: '🏅 Ganador Nato', precio: 0, requisito: 25 },
        { id: 'rich', name: '💎 Rico y Famoso', precio: 0, requisito: 10000 }
    ]
};

const casinoGames = {
    tragamonedas: {
        name: '🎰 Tragamonedas',
        minBet: 10,
        symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐'],
        payouts: {
            '💎💎💎': 50,
            '7️⃣7️⃣7️⃣': 25,
            '🔔🔔🔔': 15,
            '⭐⭐⭐': 10,
            '🍇🍇🍇': 8,
            '🍊🍊🍊': 5,
            '🍋🍋🍋': 3,
            '🍒🍒🍒': 2,
            'default': 0
        }
    }
};

const preguntasTrivia = [
    { pregunta: "¿En qué año se lanzó Minecraft?", respuesta: "2011", opciones: ["2009", "2011", "2013", "2015"], explicacion: "Minecraft fue lanzado oficialmente en 2011 por Mojang" },
    { pregunta: "¿Cuál es el río más largo del mundo?", respuesta: "Nilo", opciones: ["Amazonas", "Nilo", "Misisipi", "Yangtsé"], explicacion: "El río Nilo en África tiene 6,650 km de longitud" },
    { pregunta: "¿Qué elemento químico tiene el símbolo 'Au'?", respuesta: "Oro", opciones: ["Plata", "Oro", "Aluminio", "Argón"], explicacion: "Au viene del latín 'Aurum' que significa oro" },
    { pregunta: "¿En qué continente está Egipto?", respuesta: "África", opciones: ["África", "Asia", "Europa", "América"], explicacion: "Egipto está ubicado en el noreste de África" },
    { pregunta: "¿Cuántos lados tiene un hexágono?", respuesta: "6", opciones: ["5", "6", "7", "8"], explicacion: "Hexágono viene del griego 'hex' (seis) y 'gonia' (ángulo)" },
    { pregunta: "¿Qué planeta es conocido como 'el planeta rojo'?", respuesta: "Marte", opciones: ["Venus", "Marte", "Júpiter", "Saturno"], explicacion: "Marte aparece rojo por el óxido de hierro en su superficie" },
    { pregunta: "¿Quién pintó 'La noche estrellada'?", respuesta: "Van Gogh", opciones: ["Picasso", "Van Gogh", "Dalí", "Monet"], explicacion: "Vincent van Gogh pintó esta obra maestra en 1889" },
    { pregunta: "¿Cuál es el océano más grande del mundo?", respuesta: "Pacífico", opciones: ["Atlántico", "Índico", "Pacífico", "Ártico"], explicacion: "El océano Pacífico cubre aproximadamente 1/3 de la Tierra" },
    { pregunta: "¿Qué animal es el más rápido del mundo?", respuesta: "Guepardo", opciones: ["Leopardo", "Guepardo", "León", "Tigre"], explicacion: "El guepardo puede alcanzar 112 km/h en carreras cortas" },
    { pregunta: "¿Cuál es el hueso más largo del cuerpo humano?", respuesta: "Fémur", opciones: ["Tibia", "Fémur", "Húmero", "Radio"], explicacion: "El fémur se encuentra en el muslo y es el hueso más largo y fuerte" }
];

const commands = [
    new SlashCommandBuilder().setName('carrera').setDescription('🎪 Carrera tipo Fall Guys'),
    new SlashCommandBuilder().setName('impostor').setDescription('🕵️ Juego tipo Among Us'),
    new SlashCommandBuilder().setName('dibuja').setDescription('🎨 Dibuja y adivina'),
    new SlashCommandBuilder().setName('party').setDescription('🎪 Selecciona minijuego'),
    new SlashCommandBuilder().setName('trivia').setDescription('🧠 Trivia con preguntas variadas'),
    new SlashCommandBuilder().setName('ruleta').setDescription('🎰 Ruleta rusa'),
    new SlashCommandBuilder().setName('memoria').setDescription('🧠 Juego de memoria'),
    new SlashCommandBuilder().setName('perfil').setDescription('👤 Ver tu perfil y cosméticos'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 Tabla de clasificación'),
    new SlashCommandBuilder().setName('slot').setDescription('🎰 Máquina tragamonedas'),
    new SlashCommandBuilder().setName('solo').setDescription('🎮 Juegos para un solo jugador'),
    new SlashCommandBuilder().setName('version').setDescription('ℹ️ Ver información del bot'),
    new SlashCommandBuilder().setName('tienda').setDescription('🛒 Tienda de cosméticos'),
    new SlashCommandBuilder().setName('shop').setDescription('🛒 Tienda de cosméticos'),
    new SlashCommandBuilder().setName('daily').setDescription('📅 Recompensa diaria'),
    new SlashCommandBuilder().setName('casino').setDescription('🎰 Juegos de casino')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
        console.log('✅ Comandos registrados!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();

function getUserData(userId) {
    if (!userData.has(userId)) {
        userData.set(userId, {
            coins: 1000,
            wins: 0,
            games: 0,
            coinsWon: 0,
            dailyStreak: 0,
            lastDaily: null,
            cosmeticos: {
                marco: 'default',
                titulo: 'default',
                badges: ['gamer']
            },
            stats: {
                tragamonedas: { jugado: 0, ganado: 0 },
                trivia: { jugado: 0, ganado: 0 }
            }
        });
    }
    return userData.get(userId);
}

function updateStats(userId, game, win = false, coins = 0) {
    const data = getUserData(userId);
    data.games++;
    data.stats[game].jugado++;
    if (win) {
        data.wins++;
        data.stats[game].ganado++;
    }
    data.coinsWon += coins;
    data.coins += coins;
    
    if (data.games >= 10 && !data.cosmeticos.badges.includes('gamer')) {
        data.cosmeticos.badges.push('gamer');
    }
    if (data.wins >= 25 && !data.cosmeticos.badges.includes('winner')) {
        data.cosmeticos.badges.push('winner');
    }
    if (data.coins >= 10000 && !data.cosmeticos.badges.includes('rich')) {
        data.cosmeticos.badges.push('rich');
    }
}

client.on(Events.ClientReady, () => {
    console.log(`🎮 ${client.user.tag} con todas las funciones listo!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    if (commandName === 'tienda' || commandName === 'shop') {
        const tiendaMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('tienda_select')
                .setPlaceholder('🛒 Elige una categoría')
                .addOptions([
                    { label: 'Marcos de Perfil', description: '🖼️ Personaliza tu perfil', value: 'marcos', emoji: '🖼️' },
                    { label: 'Títulos', description: '👑 Títulos especiales', value: 'titulos', emoji: '👑' },
                    { label: 'Badges', description: '🎖️ Insignias por logros', value: 'badges', emoji: '🎖️' }
                ])
        );

        const userData = getUserData(user.id);
        const embed = new EmbedBuilder()
            .setTitle('🛒 TIENDA DE COSMÉTICOS')
            .setDescription('**Personaliza tu perfil!** ✨')
            .setColor(0x9B59B6)
            .addFields(
                { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true },
                { name: '🎁 Items Desbloqueados', value: `**${userData.cosmeticos.badges.length + 2}** items`, inline: true }
            )
            .setFooter({ text: 'Gana monedas jugando para comprar cosméticos!' });

        await interaction.reply({ embeds: [embed], components: [tiendaMenu] });
    }

    else if (commandName === 'daily') {
        const userData = getUserData(user.id);
        const now = Date.now();
        const lastDaily = userData.lastDaily;
        const oneDay = 24 * 60 * 60 * 1000;

        if (lastDaily && (now - lastDaily) < oneDay) {
            const nextDaily = new Date(lastDaily + oneDay);
            const embed = new EmbedBuilder()
                .setTitle('📅 RECOMPENSA DIARIA')
                .setDescription(`**Ya reclamaste hoy!** ⏰\nPodrás reclamar de nuevo <t:${Math.floor(nextDaily.getTime() / 1000)}:R>`)
                .setColor(0xFF0000)
                .addFields(
                    { name: '🔥 Racha Actual', value: `**${userData.dailyStreak}** días`, inline: true }
                );
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const baseReward = 100;
        const streakBonus = userData.dailyStreak * 10;
        const totalReward = baseReward + streakBonus;

        userData.coins += totalReward;
        userData.dailyStreak = lastDaily && (now - lastDaily) < (oneDay * 2) ? userData.dailyStreak + 1 : 1;
        userData.lastDaily = now;

        const embed = new EmbedBuilder()
            .setTitle('📅 RECOMPENSA DIARIA')
            .setDescription(`**¡Recompensa reclamada!** 🎉`)
            .setColor(0x00FF00)
            .addFields(
                { name: '💰 Base', value: `**${baseReward}** 🪙`, inline: true },
                { name: '🔥 Bono de Racha', value: `**${streakBonus}** 🪙`, inline: true },
                { name: '💎 Total', value: `**${totalReward}** 🪙`, inline: true },
                { name: '📈 Nueva Racha', value: `**${userData.dailyStreak}** días`, inline: true },
                { name: '💳 Saldo Actual', value: `**${userData.coins}** 🪙`, inline: true }
            )
            .setFooter({ text: 'Vuelve mañana para más recompensas!' });

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'casino') {
        const casinoMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('casino_select')
                .setPlaceholder('🎰 Elige un juego de casino')
                .addOptions([
                    { label: 'Tragamonedas', description: '🎰 Gira y gana premios', value: 'tragamonedas', emoji: '🎰' },
                    { label: 'Blackjack', description: '🃏 21 contra el dealer', value: 'blackjack', emoji: '🃏' },
                    { label: 'Ruleta', description: '🎡 Apuesta a números', value: 'ruleta', emoji: '🎡' }
                ])
        );

        const userData = getUserData(user.id);
        const embed = new EmbedBuilder()
            .setTitle('🎰 CASINO VIP')
            .setDescription('**Bienvenido al casino!** 🎲\nSelecciona un juego:')
            .setColor(0xFFD700)
            .addFields(
                { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true },
                { name: '🎯 Mejor Juego', value: 'Tragamonedas', inline: true },
                { name: '🏆 Jackpot', value: '**10,000** 🪙', inline: true }
            )
            .setFooter({ text: '¡Juega responsablemente!' });

        await interaction.reply({ embeds: [embed], components: [casinoMenu] });
    }

    else if (commandName === 'trivia') {
        const pregunta = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)];
        const userData = getUserData(user.id);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('a').setLabel(pregunta.opciones[0]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('b').setLabel(pregunta.opciones[1]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('c').setLabel(pregunta.opciones[2]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('d').setLabel(pregunta.opciones[3]).setStyle(ButtonStyle.Primary)
            );

        const embed = new EmbedBuilder()
            .setTitle('🧠 TRIVIA')
            .setDescription(`**${pregunta.pregunta}**\n\nTienes 20 segundos para responder!`)
            .setColor(0x3498DB)
            .setFooter({ text: '¡Gana 50 🪙 por respuesta correcta!' });

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.isButton() && i.user.id === user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000 });

        collector.on('collect', async i => {
            const selectedIndex = ['a', 'b', 'c', 'd'].indexOf(i.customId);
            const selectedAnswer = pregunta.opciones[selectedIndex];
            
            if (selectedAnswer === pregunta.respuesta) {
                userData.coins += 50;
                updateStats(user.id, 'trivia', true, 50);
                
                const winEmbed = new EmbedBuilder()
                    .setTitle('🎉 ¡CORRECTO!')
                    .setDescription(`**${pregunta.respuesta}** ✅\n\n*${pregunta.explicacion}*`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '💰 Premio', value: '+50 🪙', inline: true },
                        { name: '💳 Saldo Actual', value: `${userData.coins} 🪙`, inline: true }
                    );
                
                await i.reply({ embeds: [winEmbed] });
                collector.stop();
            } else {
                updateStats(user.id, 'trivia', false, 0);
                await i.reply({ 
                    content: `❌ Incorrecto! Era: **${pregunta.respuesta}**\n*${pregunta.explicacion}*`, 
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

    else if (commandName === 'perfil') {
        const data = getUserData(user.id);
        const winRate = data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : 0;
        
        const marco = cosmeticos.marcos.find(m => m.id === data.cosmeticos.marco);
        const titulo = cosmeticos.titulos.find(t => t.id === data.cosmeticos.titulo);
        const badges = data.cosmeticos.badges.map(badgeId => 
            cosmeticos.badges.find(b => b.id === badgeId)
        ).filter(b => b);

        const embed = new EmbedBuilder()
            .setTitle(`${marco.name} ${user.username} - ${titulo.name}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor(0x3498DB)
            .addFields(
                { name: '🪙 Monedas', value: `**${data.coins}** 🪙`, inline: true },
                { name: '🏆 Victorias', value: `**${data.wins}**`, inline: true },
                { name: '📊 Win Rate', value: `**${winRate}%**`, inline: true },
                { name: '🎮 Partidas', value: `**${data.games}** jugadas`, inline: true },
                { name: '🔥 Racha Diaria', value: `**${data.dailyStreak}** días`, inline: true },
                { name: '💰 Ganado Total', value: `**${data.coinsWon}** 🪙`, inline: true }
            );

        if (badges.length > 0) {
            embed.addFields({
                name: '🎖️ Insignias',
                value: badges.map(b => b.name).join('\n'),
                inline: false
            });
        }

        const casinoStats = `
🎰 **Tragamonedas**: ${data.stats.tragamonedas.ganado}/${data.stats.tragamonedas.jugado}
🧠 **Trivia**: ${data.stats.trivia.ganado}/${data.stats.trivia.jugado}
        `.trim();

        embed.addFields({ name: '🎲 Estadísticas', value: casinoStats, inline: false });
        embed.setFooter({ text: 'Usa /tienda para más cosméticos!' });

        await interaction.reply({ embeds: [embed] });
    }

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

    else if (commandName === 'version') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ INFORMACIÓN DEL BOT')
            .setColor(0x00FF00)
            .addFields(
                { name: '🔄 Versión', value: '**2.2.0**', inline: true },
                { name: '📅 Actualizado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '✅ Estado', value: '**En funcionamiento**', inline: true }
            )
            .setFooter({ text: '¡Con tienda, casino y cosméticos!' });

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'slot') {
        const userData = getUserData(user.id);
        const symbols = casinoGames.tragamonedas.symbols;
        const result = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        const bet = 50;
        if (userData.coins < bet) {
            await interaction.reply('❌ No tienes suficientes monedas! Mínimo 50 🪙');
            return;
        }

        userData.coins -= bet;
        updateStats(user.id, 'tragamonedas', false, -bet);

        const resultStr = result.join('');
        let multiplier = 0;
        
        for (const [pattern, payout] of Object.entries(casinoGames.tragamonedas.payouts)) {
            if (resultStr === pattern) {
                multiplier = payout;
                break;
            }
        }

        const winAmount = bet * multiplier;
        if (multiplier > 0) {
            userData.coins += winAmount;
            updateStats(user.id, 'tragamonedas', true, winAmount);
        }

        const embed = new EmbedBuilder()
            .setTitle('🎰 TRAGAMONEDAS')
            .setDescription(`**${result.join(' | ')}**`)
            .setColor(multiplier > 0 ? 0x00FF00 : 0xFF0000)
            .addFields(
                { name: '💰 Apuesta', value: `**${bet}** 🪙`, inline: true },
                { name: '🎯 Multiplicador', value: `**x${multiplier}**`, inline: true },
                { name: '🏆 Premio', value: multiplier > 0 ? `**+${winAmount}** 🪙` : '**0** 🪙', inline: true },
                { name: '💳 Saldo Actual', value: `**${userData.coins}** 🪙`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'leaderboard') {
        const topPlayers = Array.from(userData.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 5);

        const leaderboardText = topPlayers.map((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
            return `${medal} **${index + 1}.** <@${player.id}> - **${player.coins}** 🪙 (${player.wins}🏆)`;
        }).join('\n') || '📝 Nadie ha jugado aún...';

        const embed = new EmbedBuilder()
            .setTitle('🏆 LEADERBOARD GLOBAL')
            .setDescription(leaderboardText)
            .setColor(0xFFD700)
            .setFooter({ text: 'Actualizado en tiempo real' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    else {
        await interaction.reply(`🎮 **${commandName}** - ¡Función en desarrollo! Próximamente...`);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isStringSelectMenu()) {
        const userData = getUserData(interaction.user.id);

        if (interaction.customId === 'tienda_select') {
            const categoria = interaction.values[0];
            let items = [];
            let descripcion = '';

            if (categoria === 'marcos') {
                items = cosmeticos.marcos;
                descripcion = '**Marcos de perfil** 🖼️';
            } else if (categoria === 'titulos') {
                items = cosmeticos.titulos;
                descripcion = '**Títulos especiales** 👑';
            } else if (categoria === 'badges') {
                const embed = new EmbedBuilder()
                    .setTitle('🎖️ BADGES')
                    .setDescription('**Insignias por logros**\n\n¡Desbloquea badges jugando!')
                    .setColor(0x9B59B6)
                    .addFields(
                        { name: '🎮 Jugador Activo', value: 'Juega 10 partidas', inline: true },
                        { name: '🏅 Ganador Nato', value: 'Gana 25 partidas', inline: true },
                        { name: '💎 Rico y Famoso', value: 'Consigue 10,000 🪙', inline: true }
                    );
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const itemOptions = items.map(item => ({
                label: item.name,
                description: `Precio: ${item.precio} 🪙`,
                value: item.id
            }));

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`buy_${categoria}`)
                    .setPlaceholder(`🛒 Comprar ${descripcion}`)
                    .addOptions(itemOptions)
            );

            const embed = new EmbedBuilder()
                .setTitle(`🛒 TIENDA - ${descripcion}`)
                .setDescription('Selecciona un item para comprar:')
                .setColor(0x9B59B6)
                .addFields(
                    { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true }
                );

            await interaction.reply({ embeds: [embed], components: [selectMenu] });
        }

        else if (interaction.customId.startsWith('buy_')) {
            const categoria = interaction.customId.replace('buy_', '');
            const itemId = interaction.values[0];
            let items = [];
            
            if (categoria === 'marcos') items = cosmeticos.marcos;
            else if (categoria === 'titulos') items = cosmeticos.titulos;
            
            const item = items.find(i => i.id === itemId);
            
            if (!item) {
                await interaction.reply({ content: '❌ Item no encontrado!', ephemeral: true });
                return;
            }

            if (userData.coins < item.precio) {
                await interaction.reply({ content: '❌ No tienes suficientes monedas!', ephemeral: true });
                return;
            }

            userData.coins -= item.precio;
            userData.cosmeticos[categoria] = itemId;

            const embed = new EmbedBuilder()
                .setTitle('✅ COMPRA EXITOSA')
                .setDescription(`**Has comprado: ${item.name}**`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '💰 Precio', value: `**${item.precio}** 🪙`, inline: true },
                    { name: '💳 Saldo Restante', value: `**${userData.coins}** 🪙`, inline: true }
                )
                .setFooter({ text: '¡Usa /perfil para ver tus nuevos cosméticos!' });

            await interaction.reply({ embeds: [embed] });
        }

        else if (interaction.customId === 'casino_select') {
            const game = interaction.values[0];
            
            if (game === 'tragamonedas') {
                const betOptions = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('slot_bet')
                        .setPlaceholder('💰 Selecciona tu apuesta')
                        .addOptions([
                            { label: '10 🪙', value: '10', description: 'Apuesta pequeña' },
                            { label: '50 🪙', value: '50', description: 'Apuesta media' },
                            { label: '100 🪙', value: '100', description: 'Apuesta grande' }
                        ])
                );

                const embed = new EmbedBuilder()
                    .setTitle('🎰 TRAGAMONEDAS')
                    .setDescription('**Selecciona tu apuesta y gira!**')
                    .setColor(0xFFD700)
                    .addFields(
                        { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true },
                        { name: '🎯 Premio Máximo', value: '**x50**', inline: true }
                    );

                await interaction.reply({ embeds: [embed], components: [betOptions] });
            }
            else {
                await interaction.reply(`🎰 **${game}** - ¡En desarrollo! Próximamente...`);
            }
        }

        else if (interaction.customId === 'slot_bet') {
            const bet = parseInt(interaction.values[0]);
            
            if (userData.coins < bet) {
                await interaction.reply({ content: '❌ No tienes suficientes monedas!', ephemeral: true });
                return;
            }

            userData.coins -= bet;
            updateStats(interaction.user.id, 'tragamonedas', false, -bet);

            const symbols = casinoGames.tragamonedas.symbols;
            const result = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];

            const resultStr = result.join('');
            let multiplier = 0;
            
            for (const [pattern, payout] of Object.entries(casinoGames.tragamonedas.payouts)) {
                if (resultStr === pattern) {
                    multiplier = payout;
                    break;
                }
            }

            const winAmount = bet * multiplier;
            if (multiplier > 0) {
                userData.coins += winAmount;
                updateStats(interaction.user.id, 'tragamonedas', true, winAmount);
            }

            const embed = new EmbedBuilder()
                .setTitle('🎰 TRAGAMONEDAS - RESULTADO')
                .setDescription(`**${result.join(' | ')}**`)
                .setColor(multiplier > 0 ? 0x00FF00 : 0xFF0000)
                .addFields(
                    { name: '💰 Apuesta', value: `**${bet}** 🪙`, inline: true },
                    { name: '🎯 Multiplicador', value: `**x${multiplier}**`, inline: true },
                    { name: '🏆 Premio', value: multiplier > 0 ? `**+${winAmount}** 🪙` : '**0** 🪙', inline: true },
                    { name: '💳 Saldo Actual', value: `**${userData.coins}** 🪙`, inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        }

        else if (interaction.customId === 'solo_game_select') {
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
                    .setDescription(`**${pregunta.pregunta}**\n\n¡Tómate tu tiempo!`)
                    .setColor(0x9B59B6)
                    .setFooter({ text: 'Modo práctica - Sin límite de tiempo' });

                await interaction.reply({ embeds: [embed], components: [row] });
            }
            else {
                await interaction.reply(`🎮 **${game}** - ¡En desarrollo! Próximamente...`);
            }
        }
    }

    if (interaction.isButton() && ['a', 'b', 'c', 'd'].includes(interaction.customId)) {
        await interaction.reply({ content: '✅ Función en desarrollo!', ephemeral: true });
    }
});

client.login(config.token);