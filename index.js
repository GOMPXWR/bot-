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
const activeGames = new Map();

const cosmeticos = {
    marcos: [
        { id: 'default', name: '🖼️ Marco Básico', precio: 0 },
        { id: 'gold', name: '🌟 Marco Dorado', precio: 500 },
        { id: 'fire', name: '🔥 Marco de Fuego', precio: 800 }
    ],
    títulos: [
        { id: 'default', name: '👤 Novato', precio: 0 },
        { id: 'pro', name: '🎯 Experto', precio: 300 },
        { id: 'legend', name: '🏆 Leyenda', precio: 1000 }
    ],
    badges: [
        { id: 'gamer', name: '🎮 Jugador Activo', precio: 0, requisito: 10 },
        { id: 'winner', name: '🏅 Ganador Nato', precio: 0, requisito: 25 }
    ]
};

const casinoGames = {
    tragamonedas: {
        symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'],
        payouts: {
            '💎💎💎': 50, '7️⃣7️⃣7️⃣': 25, '🔔🔔🔔': 15, '🍇🍇🍇': 8,
            '🍊🍊🍊': 5, '🍋🍋🍋': 3, '🍒🍒🍒': 2
        }
    }
};

const preguntasTrivia = [
    { pregunta: "¿En qué año se lanzó Minecraft?", respuesta: "2011", opciones: ["2009", "2011", "2013", "2015"] },
    { pregunta: "¿Cuál es el río más largo del mundo?", respuesta: "Nilo", opciones: ["Amazonas", "Nilo", "Misisipi", "Yangtsé"] },
    { pregunta: "¿Qué elemento químico tiene el símbolo 'Au'?", respuesta: "Oro", opciones: ["Plata", "Oro", "Aluminio", "Argón"] }
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
        console.log('✅ Todos los comandos registrados!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();

function getUserData(userId) {
    if (!userData.has(userId)) {
        userData.set(userId, {
            coins: 1000, wins: 0, games: 0, coinsWon: 0, dailyStreak: 0, lastDaily: null,
            cosmeticos: { marco: 'default', titulo: 'default', badges: ['gamer'] },
            stats: { tragamonedas: { jugado: 0, ganado: 0 }, trivia: { jugado: 0, ganado: 0 } }
        });
    }
    return userData.get(userId);
}

function updateStats(userId, game, win = false, coins = 0) {
    const data = getUserData(userId);
    data.games++;
    if (data.stats[game]) {
        data.stats[game].jugado++;
        if (win) data.stats[game].ganado++;
    }
    data.coinsWon += coins;
    data.coins += coins;
    if (win) data.wins++;
    
    if (data.games >= 10 && !data.cosmeticos.badges.includes('gamer')) {
        data.cosmeticos.badges.push('gamer');
    }
    if (data.wins >= 25 && !data.cosmeticos.badges.includes('winner')) {
        data.cosmeticos.badges.push('winner');
    }
}

client.on(Events.ClientReady, () => {
    console.log(`🎮 ${client.user.tag} con TODOS los juegos listo!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    if (commandName === 'carrera') {
        const embed = new EmbedBuilder()
            .setTitle('🎪 CARRERA FALL GUYS')
            .setDescription('¡Corredores, a sus puestos! 🏃‍♂️\nReacciona con 🏃 para unirte (15 segundos)')
            .setColor(0x00FF00)
            .addFields(
                { name: '🏁 Premio', value: '**500** 🪙', inline: true },
                { name: '👥 Jugadores', value: '0/8', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
        const message = await interaction.fetchReply();
        await message.react('🏃');

        setTimeout(async () => {
            const reaction = message.reactions.cache.get('🏃');
            const users = await reaction.users.fetch();
            const players = users.filter(user => !user.bot);
            
            if (players.size === 0) {
                await interaction.followUp('❌ Nadie se unió a la carrera...');
                return;
            }

            const playerArray = Array.from(players.values());
            const progress = playerArray.map(player => {
                const distance = Math.min(10, Math.floor(Math.random() * 12));
                return `${player.username}: ${'█'.repeat(distance)}${'░'.repeat(10 - distance)} ${distance * 10}%`;
            });

            const winner = playerArray[Math.floor(Math.random() * playerArray.length)];
            getUserData(winner.id).coins += 500;
            updateStats(winner.id, 'carrera', true, 500);
            
            const resultEmbed = new EmbedBuilder()
                .setTitle('🏁 RESULTADOS DE LA CARRERA')
                .setDescription(progress.join('\n'))
                .addFields({ name: '🎉 GANADOR', value: `${winner.username} +500 🪙` })
                .setColor(0xFFD700);

            await interaction.followUp({ embeds: [resultEmbed] });
        }, 15000);
    }

    else if (commandName === 'impostor') {
        const embed = new EmbedBuilder()
            .setTitle('🕵️ AMONG US - IMPOSTOR')
            .setDescription('Reacciona con ✅ para unirte al juego (20 segundos)')
            .setColor(0xFF0000)
            .setFooter({ text: 'Mínimo 3 jugadores' });

        await interaction.reply({ embeds: [embed] });
        const message = await interaction.fetchReply();
        await message.react('✅');

        setTimeout(async () => {
            const reaction = message.reactions.cache.get('✅');
            const users = await reaction.users.fetch();
            const players = users.filter(user => !user.bot);
            
            if (players.size < 3) {
                await interaction.followUp('❌ Se necesitan al menos 3 jugadores!');
                return;
            }

            const playerArray = Array.from(players.values());
            const impostorIndex = Math.floor(Math.random() * playerArray.length);
            const impostor = playerArray[impostorIndex];
            
            for (const player of playerArray) {
                try {
                    if (player.id === impostor.id) {
                        await player.send('🎭 **Eres el 👹 IMPOSTOR!**\nSabotea sin que te descubran!');
                    } else {
                        await player.send('🎭 **Eres un 👨‍🚀 TRIPULANTE!**\nEncuentra al impostor!');
                    }
                } catch (error) {}
            }
            
            await interaction.followUp(
                `🎮 **JUGADORES:** ${playerArray.map(p => p.username).join(', ')}\n` +
                `👹 **El impostor está entre ustedes...**\n` +
                `💬 Discuten y voten mencionando al sospechoso!\n` +
                `||El impostor era... **${impostor.username}** 😈||`
            );
        }, 20000);
    }

    else if (commandName === 'dibuja') {
        const palabras = ['🐉 dragón', '🍦 helado', '📞 teléfono', '🚲 bicicleta', '🔥 fuego', '🏠 casa', '🐱 gato'];
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        
        try {
            await interaction.user.send(`🎨 **Tu palabra a dibujar es:** ||${palabra}||\n\nDescríbela con emojis o texto en el canal!`);
            await interaction.reply(`✅ **${interaction.user.username}** está dibujando algo... ¡Adivinen qué es! 🎨`);

            setTimeout(async () => {
                await interaction.followUp(`🕒 **TIEMPO AGOTADO!** La palabra era: **${palabra}**`);
            }, 60000);
            
        } catch (error) {
            await interaction.reply('❌ No puedo enviarte MD! Activa tus mensajes directos.');
        }
    }

    else if (commandName === 'party') {
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('party_select')
                .setPlaceholder('🎪 Elige un juego grupal')
                .addOptions([
                    { label: 'Carrera Fall Guys', description: '🏃‍♂️ Corre y gana', value: 'carrera', emoji: '🏃' },
                    { label: 'Among Us', description: '🕵️ Encuentra al impostor', value: 'impostor', emoji: '👹' },
                    { label: 'Dibuja y Adivina', description: '🎨 Demuestra tu arte', value: 'dibuja', emoji: '✏️' },
                    { label: 'Trivia Battle', description: '🧠 Pon a prueba tu mente', value: 'trivia', emoji: '📚' },
                    { label: 'Ruleta Rusa', description: '🎰 ¿Quién sobrevive?', value: 'ruleta', emoji: '🔫' }
                ])
        );

        const embed = new EmbedBuilder()
            .setTitle('🎪 PARTY GAMES')
            .setDescription('**Juegos para jugar con amigos!**\nSelecciona un juego:')
            .setColor(0x9B59B6);

        await interaction.reply({ embeds: [embed], components: [selectMenu] });
    }

    else if (commandName === 'ruleta') {
        const participantes = [interaction.user];
        
        const embed = new EmbedBuilder()
            .setTitle('🎰 RULETA RUSA')
            .setDescription(`**Jugadores:** ${participantes.map(p => p.username).join(', ')}\n\nReacciona con 🔫 para unirte!`)
            .setColor(0x2C2C2C)
            .setFooter({ text: '15 segundos para unirse' });

        await interaction.reply({ embeds: [embed] });
        const message = await interaction.fetchReply();
        await message.react('🔫');

        setTimeout(async () => {
            const reaction = message.reactions.cache.get('🔫');
            const users = await reaction.users.fetch();
            const nuevosJugadores = users.filter(user => !user.bot && !participantes.includes(user));
            participantes.push(...Array.from(nuevosJugadores.values()));

            if (participantes.length === 0) {
                await interaction.followUp('❌ Nadie se unió al juego...');
                return;
            }

            const balas = 6;
            const balaMortifera = Math.floor(Math.random() * balas) + 1;
            let resultados = [];

            for (let disparo = 1; disparo <= balas; disparo++) {
                const jugador = participantes[(disparo - 1) % participantes.length];
                if (disparo === balaMortifera) {
                    resultados.push(`💀 **${jugador.username}** recibió el disparo mortal!`);
                    break;
                } else {
                    resultados.push(`✅ **${jugador.username}** sobrevivió al disparo ${disparo}`);
                }
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle('💀 RESULTADO RULETA RUSA')
                .setDescription(resultados.join('\n'))
                .setColor(0x8B0000);

            await interaction.followUp({ embeds: [resultEmbed] });
        }, 15000);
    }

    else if (commandName === 'memoria') {
        const emojis = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍋'];
        const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        
        let tablero = '```\n';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                tablero += '❓ ';
            }
            tablero += '\n';
        }
        tablero += '```';

        const embed = new EmbedBuilder()
            .setTitle('🧠 JUEGO DE MEMORIA')
            .setDescription(`Encuentra las parejas!\n${tablero}`)
            .setColor(0x8E44AD)
            .setFooter({ text: 'Selecciona dos cartas iguales' });

        await interaction.reply({ embeds: [embed] });
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
                    .setDescription(`**${pregunta.respuesta}** ✅`)
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
                    content: `❌ Incorrecto! Era: **${pregunta.respuesta}**`, 
                    ephemeral: true 
                });
                collector.stop();
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await interaction.followUp({ 
                    content: `⏰ **TIEMPO AGOTADO!** La respuesta era: **${pregunta.respuesta}**` 
                });
            }
        });
    }

    else if (commandName === 'tienda' || commandName === 'shop') {
        const tiendaMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('tienda_select')
                .setPlaceholder('🛒 Elige una categoría')
                .addOptions([
                    { label: 'Marcos de Perfil', description: '🖼️ Personaliza tu perfil', value: 'marcos', emoji: '🖼️' },
                    { label: 'Títulos', description: '👑 Títulos especiales', value: 'titulos', emoji: '👑' }
                ])
        );

        const userData = getUserData(user.id);
        const embed = new EmbedBuilder()
            .setTitle('🛒 TIENDA DE COSMÉTICOS')
            .setDescription('**Personaliza tu perfil!** ✨')
            .setColor(0x9B59B6)
            .addFields(
                { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true }
            );

        await interaction.reply({ embeds: [embed], components: [tiendaMenu] });
    }

    else if (commandName === 'daily') {
        const userData = getUserData(user.id);
        const now = Date.now();
        const lastDaily = userData.lastDaily;
        const oneDay = 24 * 60 * 60 * 1000;

        if (lastDaily && (now - lastDaily) < oneDay) {
            const embed = new EmbedBuilder()
                .setTitle('📅 RECOMPENSA DIARIA')
                .setDescription(`**Ya reclamaste hoy!** ⏰`)
                .setColor(0xFF0000);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const reward = 100 + (userData.dailyStreak * 10);
        userData.coins += reward;
        userData.dailyStreak++;
        userData.lastDaily = now;

        const embed = new EmbedBuilder()
            .setTitle('📅 RECOMPENSA DIARIA')
            .setDescription(`**¡Recompensa reclamada!** 🎉`)
            .setColor(0x00FF00)
            .addFields(
                { name: '💰 Recompensa', value: `**${reward}** 🪙`, inline: true },
                { name: '🔥 Racha', value: `**${userData.dailyStreak}** días`, inline: true },
                { name: '💳 Saldo', value: `**${userData.coins}** 🪙`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'casino') {
        const casinoMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('casino_select')
                .setPlaceholder('🎰 Elige un juego de casino')
                .addOptions([
                    { label: 'Tragamonedas', description: '🎰 Gira y gana premios', value: 'tragamonedas', emoji: '🎰' }
                ])
        );

        const userData = getUserData(user.id);
        const embed = new EmbedBuilder()
            .setTitle('🎰 CASINO')
            .setDescription('**Bienvenido al casino!** 🎲')
            .setColor(0xFFD700)
            .addFields(
                { name: '💰 Tu Saldo', value: `**${userData.coins}** 🪙`, inline: true }
            );

        await interaction.reply({ embeds: [embed], components: [casinoMenu] });
    }

    else if (commandName === 'solo') {
        const gamesMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('solo_game_select')
                .setPlaceholder('🎮 Elige un juego individual')
                .addOptions([
                    { label: 'Adivina el Número', description: '🎯 Clásico juego de adivinanza', value: 'adivina', emoji: '🔢' },
                    { label: 'Piedra Papel Tijera', description: '✂️ Contra la máquina', value: 'ppt', emoji: '🪨' }
                ])
        );

        const embed = new EmbedBuilder()
            .setTitle('🎮 MODO SOLO')
            .setDescription('**Juega a tu ritmo!**')
            .setColor(0x7289DA);

        await interaction.reply({ embeds: [embed], components: [gamesMenu] });
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
                { name: '💰 Premio', value: multiplier > 0 ? `**+${winAmount}** 🪙` : '**0** 🪙', inline: true },
                { name: '💳 Saldo', value: `**${userData.coins}** 🪙`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'perfil') {
        const data = getUserData(user.id);
        const winRate = data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : 0;
        
        const marco = cosmeticos.marcos.find(m => m.id === data.cosmeticos.marco);
        const titulo = cosmeticos.titulos.find(t => t.id === data.cosmeticos.titulo);

        const embed = new EmbedBuilder()
            .setTitle(`${marco.name} ${user.username} - ${titulo.name}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor(0x3498DB)
            .addFields(
                { name: '🪙 Monedas', value: `**${data.coins}** 🪙`, inline: true },
                { name: '🏆 Victorias', value: `**${data.wins}**`, inline: true },
                { name: '📊 Win Rate', value: `**${winRate}%**`, inline: true },
                { name: '🎮 Partidas', value: `**${data.games}** jugadas`, inline: true }
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
            return `${medal} **${index + 1}.** <@${player.id}> - **${player.coins}** 🪙`;
        }).join('\n') || '📝 Nadie ha jugado aún...';

        const embed = new EmbedBuilder()
            .setTitle('🏆 LEADERBOARD')
            .setDescription(leaderboardText)
            .setColor(0xFFD700);

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'version') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ INFORMACIÓN DEL BOT')
            .setColor(0x00FF00)
            .addFields(
                { name: '🔄 Versión', value: '**2.3.0**', inline: true },
                { name: '✅ Estado', value: '**En funcionamiento**', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isStringSelectMenu()) {
        const userData = getUserData(interaction.user.id);

        if (interaction.customId === 'party_select') {
            const game = interaction.values[0];
            await interaction.reply({ content: `🎮 Iniciando: **${game}** - Usa \`/${game}\` para jugar!`, ephemeral: true });
        }

        else if (interaction.customId === 'tienda_select') {
            const categoria = interaction.values[0];
            let items = [];

            if (categoria === 'marcos') items = cosmeticos.marcos;
            else if (categoria === 'titulos') items = cosmeticos.titulos;

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`buy_${categoria}`)
                    .setPlaceholder(`🛒 Comprar ${categoria}`)
                    .addOptions(items.map(item => ({
                        label: item.name,
                        description: `Precio: ${item.precio} 🪙`,
                        value: item.id
                    })))
            );

            const embed = new EmbedBuilder()
                .setTitle(`🛒 TIENDA - ${categoria}`)
                .setColor(0x9B59B6);

            await interaction.reply({ embeds: [embed], components: [selectMenu] });
        }

        else if (interaction.customId.startsWith('buy_')) {
            const categoria = interaction.customId.replace('buy_', '');
            const itemId = interaction.values[0];
            let items = [];
            
            if (categoria === 'marcos') items = cosmeticos.marcos;
            else if (categoria === 'titulos') items = cosmeticos.titulos;
            
            const item = items.find(i => i.id === itemId);
            
            if (userData.coins < item.precio) {
                await interaction.reply({ content: '❌ No tienes suficientes monedas!', ephemeral: true });
                return;
            }

            userData.coins -= item.precio;
            userData.cosmeticos[categoria] = itemId;

            const embed = new EmbedBuilder()
                .setTitle('✅ COMPRA EXITOSA')
                .setDescription(`**Has comprado: ${item.name}**`)
                .setColor(0x00FF00);

            await interaction.reply({ embeds: [embed] });
        }

        else if (interaction.customId === 'casino_select') {
            const game = interaction.values[0];
            await interaction.reply({ content: `🎰 Iniciando: **${game}** - Usa \`/${game}\` para jugar!`, ephemeral: true });
        }

        else if (interaction.customId === 'solo_game_select') {
            const game = interaction.values[0];
            
            if (game === 'adivina') {
                const numero = Math.floor(Math.random() * 100) + 1;
                await interaction.reply(`🔢 **Adivina el número entre 1 y 100**\nEscribe tu respuesta en el chat!`);
                
            } else if (game === 'ppt') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('piedra').setLabel('🪨 Piedra').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('papel').setLabel('📄 Papel').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('tijera').setLabel('✂️ Tijera').setStyle(ButtonStyle.Danger)
                );

                const embed = new EmbedBuilder()
                    .setTitle('🪨 PIEDRA, PAPEL O TIJERA')
                    .setDescription('**Elige tu movimiento:**')
                    .setColor(0xFFA500);

                await interaction.reply({ embeds: [embed], components: [row] });
            }
        }
    }

    if (interaction.isButton() && ['piedra', 'papel', 'tijera'].includes(interaction.customId)) {
        const userChoice = interaction.customId;
        const opciones = ['piedra', 'papel', 'tijera'];
        const botChoice = opciones[Math.floor(Math.random() * 3)];
        
        let resultado = '';
        let color = 0x000000;
        
        if (userChoice === botChoice) {
            resultado = '**EMPATE** 🤝';
            color = 0xFFFF00;
        } else if (
            (userChoice === 'piedra' && botChoice === 'tijera') ||
            (userChoice === 'papel' && botChoice === 'piedra') ||
            (userChoice === 'tijera' && botChoice === 'papel')
        ) {
            resultado = '**¡GANASTE!** 🎉';
            color = 0x00FF00;
            const userData = getUserData(interaction.user.id);
            userData.coins += 25;
        } else {
            resultado = '**Perdiste...** 💀';
            color = 0xFF0000;
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🪨 PIEDRA, PAPEL O TIJERA')
            .setDescription(`${resultado}`)
            .setColor(color)
            .addFields(
                { name: '👤 Tu elección', value: `**${userChoice.toUpperCase()}**`, inline: true },
                { name: '🤖 Mi elección', value: `**${botChoice.toUpperCase()}**`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(config.token);