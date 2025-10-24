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

// Sistema mejorado de economía, stats y cosméticos
const userData = new Map();

// Cosméticos disponibles
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

// Juegos de casino
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
    },
    blackjack: {
        name: '🃏 Blackjack',
        minBet: 20
    },
    ruleta: {
        name: '🎡 Ruleta',
        minBet: 10
    }
};

// Comandos completos actualizados
const commands = [
    new SlashCommandBuilder().setName('carrera').setDescription('🎪 Carrera tipo Fall Guys'),
    new SlashCommandBuilder().setName('impostor').setDescription('🕵️ Juego tipo Among Us'),
    new SlashCommandBuilder().setName('dibuja').setDescription('🎨 Dibuja y adivina'),
    new SlashCommandBuilder().setName('party').setDescription('🎪 Selecciona minijuego'),
    new SlashCommandBuilder().setName('trivia').setDescription('🧠 Trivia corregida'),
    new SlashCommandBuilder().setName('ruleta').setDescription('🎰 Ruleta rusa'),
    new SlashCommandBuilder().setName('memoria').setDescription('🧠 Juego de memoria'),
    new SlashCommandBuilder().setName('perfil').setDescription('👤 Ver tu perfil y cosméticos'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 Tabla de clasificación'),
    new SlashCommandBuilder().setName('casino').setDescription('🎰 Juegos de casino'),
    new SlashCommandBuilder().setName('solo').setDescription('🎮 Juegos para un solo jugador'),
    new SlashCommandBuilder().setName('version').setDescription('ℹ️ Ver información del bot'),
    new SlashCommandBuilder().setName('tienda').setDescription('🛒 Tienda de cosméticos'),
    new SlashCommandBuilder().setName('daily').setDescription('📅 Recompensa diaria')
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

// Función para obtener datos del usuario
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
                blackjack: { jugado: 0, ganado: 0 },
                ruleta: { jugado: 0, ganado: 0 }
            }
        });
    }
    return userData.get(userId);
}

// Función para actualizar stats
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
    
    // Actualizar badges
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
    console.log(`🎮 ${client.user.tag} con casino y cosméticos listo!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    if (commandName === 'casino') {
        const casinoMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('casino_select')
                .setPlaceholder('🎰 Elige un juego de casino')
                .addOptions([
                    { label: 'Tragamonedas', description: '🎰 Gira y gana premios', value: 'tragamonedas', emoji: '🎰' },
                    { label: 'Blackjack', description: '🃏 21 contra el dealer', value: 'blackjack', emoji: '🃏' },
                    { label: 'Ruleta', description: '🎡 Apuesta a números', value: 'ruleta', emoji: '🎡' },
                    { label: 'Dados', description: '🎲 Juego de dados', value: 'dados', emoji: '🎲' }
                ])
        );

        const embed = new EmbedBuilder()
            .setTitle('🎰 CASINO VIP')
            .setDescription('**Bienvenido al casino!** 🎲\nSelecciona un juego:')
            .setColor(0xFFD700)
            .addFields(
                { name: '💰 Tu Saldo', value: `**${getUserData(user.id).coins}** 🪙`, inline: true },
                { name: '🎯 Mejor Juego', value: 'Tragamonedas', inline: true },
                { name: '🏆 Jackpot', value: '**10,000** 🪙', inline: true }
            )
            .setFooter({ text: '¡Juega responsablemente!' });

        await interaction.reply({ embeds: [embed], components: [casinoMenu] });
    }

    else if (commandName === 'solo') {
        const gamesMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('solo_game_select')
                .setPlaceholder('🎮 Elige un juego individual')
                .addOptions([
                    { label: 'Adivina el Número', description: '🎯 Clásico juego de adivinanza', value: 'adivina', emoji: '🔢' },
                    { label: 'Piedra Papel Tijera', description: '✂️ Contra la máquina', value: 'ppt', emoji: '🪨' },
                    { label: 'Quiz Diario', description: '🧠 Desafío único del día', value: 'quiz', emoji: '📝' },
                    { label: 'Ahorcado', description: '💀 Adivina la palabra', value: 'ahorcado', emoji: '💀' },
                    { label: 'Sudoku', description: '🔢 Rompecabezas numérico', value: 'sudoku', emoji: '9️⃣' }
                ])
        );

        const embed = new EmbedBuilder()
            .setTitle('🎮 MODO SOLO MEJORADO')
            .setDescription('**Juegos individuales con recompensas!**\nSelecciona un juego:')
            .setColor(0x7289DA)
            .addFields(
                { name: '👤 Jugador', value: `${user.username}`, inline: true },
                { name: '💰 Recompensas', value: 'Hasta **100** 🪙', inline: true }
            );

        await interaction.reply({ embeds: [embed], components: [gamesMenu] });
    }

    else if (commandName === 'tienda') {
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

        // Calcular recompensa
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

    else if (commandName === 'perfil') {
        const data = getUserData(user.id);
        const winRate = data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : 0;
        
        // Obtener nombres de cosméticos
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

        // Estadísticas de casino
        const casinoStats = `
🎰 **Tragamonedas**: ${data.stats.tragamonedas.ganado}/${data.stats.tragamonedas.jugado}
🃏 **Blackjack**: ${data.stats.blackjack.ganado}/${data.stats.blackjack.jugado}
🎡 **Ruleta**: ${data.stats.ruleta.ganado}/${data.stats.ruleta.jugado}
        `.trim();

        embed.addFields({ name: '🎲 Estadísticas Casino', value: casinoStats, inline: false });
        embed.setFooter({ text: 'Usa /tienda para más cosméticos!' });

        await interaction.reply({ embeds: [embed] });
    }

    // ... (mantén tus otros comandos existentes: carrera, impostor, dibuja, party, trivia, etc.) ...

    else if (commandName === 'version') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ INFORMACIÓN DEL BOT')
            .setColor(0x00FF00)
            .addFields(
                { name: '🔄 Versión', value: '**2.0.0**', inline: true },
                { name: '📅 Actualizado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '✅ Estado', value: '**En funcionamiento**', inline: true }
            )
            .setFooter({ text: '¡Ahora con casino y cosméticos!' });

        await interaction.reply({ embeds: [embed] });
    }
});

// Manejar interacciones de menús y botones
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isStringSelectMenu()) {
        const userData = getUserData(interaction.user.id);

        if (interaction.customId === 'casino_select') {
            const game = interaction.values[0];
            
            if (game === 'tragamonedas') {
                const betOptions = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('slot_bet')
                        .setPlaceholder('💰 Selecciona tu apuesta')
                        .addOptions([
                            { label: '10 🪙', value: '10', description: 'Apuesta pequeña' },
                            { label: '50 🪙', value: '50', description: 'Apuesta media' },
                            { label: '100 🪙', value: '100', description: 'Apuesta grande' },
                            { label: '500 🪙', value: '500', description: 'Apuesta alta' }
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
        }

        else if (interaction.customId === 'slot_bet') {
            const bet = parseInt(interaction.values[0]);
            
            if (userData.coins < bet) {
                await interaction.reply({ content: '❌ No tienes suficientes monedas!', ephemeral: true });
                return;
            }

            userData.coins -= bet;
            updateStats(interaction.user.id, 'tragamonedas', false, -bet);

            // Girar tragamonedas
            const symbols = casinoGames.tragamonedas.symbols;
            const result = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];

            // Calcular premio
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

        else if (interaction.customId === 'tienda_select') {
            const categoria = interaction.values[0];
            let items = [];
            let descripcion = '';

            if (categoria === 'marcos') {
                items = cosmeticos.marcos;
                descripcion = '**Marcos de perfil** 🖼️';
            } else if (categoria === 'titulos') {
                items = cosmeticos.titulos;
                descripcion = '**Títulos especiales** 👑';
            }

            const itemOptions = items.map(item => 
                new StringSelectMenuBuilder()
                    .setCustomId(`buy_${categoria}_${item.id}`)
                    .setPlaceholder(`🛒 Comprar ${item.name}`)
                    .addOptions([{
                        label: item.name,
                        description: `Precio: ${item.precio} 🪙`,
                        value: item.id
                    }])
            );

            const embed = new EmbedBuilder()
                .setTitle(`🛒 TIENDA - ${descripcion}`)
                .setDescription('Selecciona un item para comprar:')
                .setColor(0x9B59B6)
                .addFields(
                    { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true }
                );

            const rows = itemOptions.map(option => new ActionRowBuilder().addComponents(option));
            await interaction.reply({ embeds: [embed], components: rows });
        }

        else if (interaction.customId.startsWith('buy_')) {
            const [_, categoria, itemId] = interaction.customId.split('_');
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

            // Comprar item
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

        else if (interaction.customId === 'solo_game_select') {
            const game = interaction.values[0];
            
            if (game === 'ahorcado') {
                const palabras = ['PROGRAMACION', 'DISCORD', 'JAVASCRIPT', 'BOT', 'VIDEOJUEGO', 'COMPUTADORA'];
                const palabra = palabras[Math.floor(Math.random() * palabras.length)];
                let vidas = 6;
                let letrasAdivinadas = Array(palabra.length).fill('_');
                let letrasUsadas = [];
                
                const embed = new EmbedBuilder()
                    .setTitle('💀 AHORCADO')
                    .setDescription(`**Palabra:** \`${letrasAdivinadas.join(' ')}\``)
                    .setColor(0x8B0000)
                    .addFields(
                        { name: '❤️ Vidas', value: '❤️'.repeat(vidas), inline: true },
                        { name: '🔤 Letras Usadas', value: letrasUsadas.join(', ') || 'Ninguna', inline: true }
                    )
                    .setFooter({ text: 'Escribe una letra para adivinar' });

                await interaction.reply({ embeds: [embed] });
                
                // Lógica del ahorcado...
            }
            else if (game === 'quiz') {
                const quizzes = [
                    {
                        pregunta: "¿Cuál es el lenguaje de programación más usado en 2024?",
                        opciones: ["Python", "JavaScript", "Java", "C++"],
                        respuesta: "JavaScript"
                    }
                ];
                
                const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
                const row = new ActionRowBuilder().addComponents(
                    ...quiz.opciones.map((opcion, index) => 
                        new ButtonBuilder()
                            .setCustomId(`quiz_${index}`)
                            .setLabel(opcion)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

                const embed = new EmbedBuilder()
                    .setTitle('🧠 QUIZ DIARIO')
                    .setDescription(`**${quiz.pregunta}**`)
                    .setColor(0x3498DB)
                    .setFooter({ text: '¡Gana 50 🪙 por respuesta correcta!' });

                await interaction.reply({ embeds: [embed], components: [row] });
            }
        }
    }

    // Manejar botones de quiz
    if (interaction.isButton() && interaction.customId.startsWith('quiz_')) {
        const quizIndex = parseInt(interaction.customId.split('_')[1]);
        // Lógica para verificar respuesta del quiz...
        await interaction.reply({ content: '✅ Respuesta procesada!', ephemeral: true });
    }
});

client.login(config.token);