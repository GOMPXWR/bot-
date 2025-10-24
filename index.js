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

// Sistema de economía y stats
const userCoins = new Map();
const userStats = new Map();

// Comandos completos
const commands = [
    new SlashCommandBuilder().setName('carrera').setDescription('🎪 Carrera tipo Fall Guys con gráficos'),
    new SlashCommandBuilder().setName('impostor').setDescription('🕵️ Juego tipo Among Us mejorado'),
    new SlashCommandBuilder().setName('dibuja').setDescription('🎨 Dibuja y adivina con más palabras'),
    new SlashCommandBuilder().setName('party').setDescription('🎪 Selecciona minijuego con menú'),
    new SlashCommandBuilder().setName('trivia').setDescription('🧠 Trivia con categorías corregida'),
    new SlashCommandBuilder().setName('ruleta').setDescription('🎰 Ruleta rusa con efectos'),
    new SlashCommandBuilder().setName('memoria').setDescription('🧠 Juego de memoria interactivo'),
    new SlashCommandBuilder().setName('perfil').setDescription('👤 Ver tu perfil y estadísticas'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 Tabla de clasificación'),
    new SlashCommandBuilder().setName('slot').setDescription('🎰 Máquina tragamonedas'),
    new SlashCommandBuilder().setName('battle').setDescription('⚔️ Batalla por turnos 1vs1'),
    new SlashCommandBuilder().setName('solo').setDescription('🎮 Juegos para un solo jugador'),
    new SlashCommandBuilder().setName('version').setDescription('ℹ️ Ver información del bot')
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

// Función para obtener coins
function getCoins(userId) {
    if (!userCoins.has(userId)) {
        userCoins.set(userId, 1000);
        userStats.set(userId, { wins: 0, games: 0, coinsWon: 0 });
    }
    return userCoins.get(userId);
}

// Función para actualizar stats
function updateStats(userId, win = false, coins = 0) {
    const stats = userStats.get(userId) || { wins: 0, games: 0, coinsWon: 0 };
    stats.games++;
    if (win) stats.wins++;
    stats.coinsWon += coins;
    userStats.set(userId, stats);
}

client.on(Events.ClientReady, () => {
    console.log(`🎮 ${client.user.tag} mejorado y listo!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    if (commandName === 'carrera') {
        const embed = new EmbedBuilder()
            .setTitle('🎪 CARRERA EPIC RUN')
            .setDescription('¡Corredores, a sus puestos! 🏃‍♂️')
            .addFields(
                { name: '🏁 Premio', value: '**500** 🪙', inline: true },
                { name: '👥 Jugadores', value: '0/8', inline: true },
                { name: '⏱️ Tiempo', value: '20 segundos', inline: true }
            )
            .setColor(0x00FF00)
            .setFooter({ text: 'Reacciona con 🏃 para unirte!' });

        const joinButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_race').setLabel('🎯 UNIRME').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('view_prizes').setLabel('🏆 PREMIOS').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [joinButton] });
    }

    else if (commandName === 'party') {
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('game_select')
                .setPlaceholder('🎮 Selecciona un juego')
                .addOptions([
                    { label: 'Carrera Obstáculos', description: '🎪 Corre y gana', value: 'carrera', emoji: '🏃' },
                    { label: 'Encuentra al Impostor', description: '🕵️ Detective time', value: 'impostor', emoji: '👹' },
                    { label: 'Dibuja y Adivina', description: '🎨 Demuestra tu arte', value: 'dibuja', emoji: '✏️' },
                    { label: 'Trivia Battle', description: '🧠 Pon a prueba tu mente', value: 'trivia', emoji: '📚' },
                    { label: 'Ruleta Rusa', description: '🎰 ¿Quién sobrevive?', value: 'ruleta', emoji: '🔫' },
                    { label: 'Modo Solo', description: '🎮 Juega individual', value: 'solo', emoji: '👤' }
                ])
        );

        const embed = new EmbedBuilder()
            .setTitle('🎪 BEST PARTY HUB')
            .setDescription('**Selecciona un juego de la lista** ⬇️')
            .setColor(0x9B59B6)
            .addFields(
                { name: '🎯 Juegos Activos', value: '`6` disponibles', inline: true },
                { name: '👥 Jugadores Online', value: '`12` en línea', inline: true },
                { name: '🏆 Evento Actual', value: 'Torneo Semanal', inline: true }
            );

        await interaction.reply({ embeds: [embed], components: [selectMenu] });
    }

    else if (commandName === 'trivia') {
        const preguntas = [
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
            }
        ];
        
        const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('a').setLabel(pregunta.opciones[0]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('b').setLabel(pregunta.opciones[1]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('c').setLabel(pregunta.opciones[2]).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('d').setLabel(pregunta.opciones[3]).setStyle(ButtonStyle.Primary)
            );

        const embed = new EmbedBuilder()
            .setTitle('🧠 TRIVIA VERIFICADA')
            .setDescription(`**${pregunta.pregunta}**\n\nTienes 20 segundos para responder!`)
            .setColor(0x3498DB)
            .setFooter({ text: '¡Respuestas 100% correctas! ✅' });

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.isButton();
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000 });

        collector.on('collect', async i => {
            const selectedIndex = ['a', 'b', 'c', 'd'].indexOf(i.customId);
            const selectedAnswer = pregunta.opciones[selectedIndex];
            
            if (selectedAnswer === pregunta.respuesta) {
                const winEmbed = new EmbedBuilder()
                    .setTitle('🎉 ¡CORRECTO!')
                    .setDescription(`**${pregunta.respuesta}** ✅\n\n*${pregunta.explicacion}*`)
                    .setColor(0x00FF00);
                
                await i.reply({ embeds: [winEmbed] });
                collector.stop();
            } else {
                await i.reply({ 
                    content: `❌ Incorrecto! Era: **${pregunta.respuesta}**`, 
                    ephemeral: true 
                });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.followUp(`⏰ **TIEMPO AGOTADO!** La respuesta era: ${pregunta.respuesta}`);
            }
        });
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
            .setDescription('**Juega aunque tus amigos no estén conectados!**\nSelecciona un juego:')
            .setColor(0x7289DA)
            .addFields(
                { name: '👤 Jugador', value: `${interaction.user.username}`, inline: true },
                { name: '🎯 Record', value: '**0** victorias', inline: true }
            )
            .setFooter({ text: '¡Perfecto para cuando juegas solo!' });

        await interaction.reply({ embeds: [embed], components: [gamesMenu] });
    }

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
                { name: '🎮 Partidas', value: `**${stats.games}** jugadas`, inline: true }
            )
            .setFooter({ text: 'Sigue jugando para mejorar tus stats!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'leaderboard') {
        const topPlayers = Array.from(userStats.entries())
            .map(([id, stats]) => ({ id, ...stats, coins: userCoins.get(id) || 0 }))
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 5);

        const leaderboardText = topPlayers.map((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
            return `${medal} **${index + 1}.** <@${player.id}> - **${player.coins}** 🪙`;
        }).join('\n') || '📝 Nadie ha jugado aún...';

        const embed = new EmbedBuilder()
            .setTitle('🏆 LEADERBOARD GLOBAL')
            .setDescription(leaderboardText)
            .setColor(0xFFD700)
            .setFooter({ text: 'Actualizado en tiempo real' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'slot') {
        const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
        const spin = () => Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
        
        const result = spin();
        const coins = getCoins(user.id);
        const bet = 50;
        
        if (coins < bet) {
            await interaction.reply('❌ No tienes suficientes monedas! Mínimo 50 🪙');
            return;
        }

        userCoins.set(user.id, coins - bet);

        let winMultiplier = 0;
        if (result[0] === result[1] && result[1] === result[2]) {
            winMultiplier = result[0] === '💎' ? 10 : result[0] === '7️⃣' ? 5 : 3;
        } else if (result[0] === result[1] || result[1] === result[2]) {
            winMultiplier = 1;
        }

        const winAmount = bet * winMultiplier;
        if (winMultiplier > 0) {
            userCoins.set(user.id, coins - bet + winAmount);
            updateStats(user.id, true, winAmount);
        }

        const embed = new EmbedBuilder()
            .setTitle('🎰 SLOT MACHINE')
            .setDescription(`**${result.join(' | ')}**`)
            .setColor(winMultiplier > 0 ? 0x00FF00 : 0xFF0000)
            .addFields(
                { name: '🎯 Resultado', value: winMultiplier > 0 ? `**¡GANASTE!** x${winMultiplier}` : '**Perdiste...**', inline: true },
                { name: '💰 Premio', value: winMultiplier > 0 ? `**+${winAmount}** 🪙` : '**0** 🪙', inline: true },
                { name: '💳 Saldo', value: `**${getCoins(user.id)}** 🪙`, inline: true }
            )
            .setFooter({ text: `Apuesta: ${bet} 🪙` });

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'version') {
        const embed = new EmbedBuilder()
            .setTitle('ℹ️ INFORMACIÓN DEL BOT')
            .setColor(0x00FF00)
            .addFields(
                { name: '🔄 Versión', value: '**1.0.0**', inline: true },
                { name: '📅 Actualizado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '✅ Estado', value: '**En funcionamiento**', inline: true }
            )
            .setFooter({ text: 'Bot activo y funcionando' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'impostor') {
        const embed = new EmbedBuilder()
            .setTitle('🕵️ JUEGO DEL IMPOSTOR')
            .setDescription('Reacciona con ✅ para unirte al juego')
            .setColor(0xFF0000)
            .setFooter({ text: '20 segundos para unirse' });

        await interaction.reply({ embeds: [embed] });
        const message = await interaction.fetchReply();
        await message.react('✅');
    }

    else if (commandName === 'dibuja') {
        const palabras = ['🐉 dragón', '🍦 helado', '📞 teléfono', '🚲 bicicleta', '🔥 fuego'];
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        
        try {
            await interaction.user.send(`🎨 **Tu palabra a dibujar es:** ||${palabra}||\n\nDescríbela con emojis o texto en el canal!`);
            await interaction.reply(`✅ **${interaction.user.username}** está dibujando algo... ¡Adivinen qué es! 🎨`);
        } catch (error) {
            await interaction.reply('❌ No puedo enviarte MD! Activa tus mensajes directos.');
        }
    }

    else if (commandName === 'ruleta') {
        await interaction.reply('🎰 **Ruleta Rusa** - ¡Juego en desarrollo! Próximamente...');
    }

    else if (commandName === 'memoria') {
        await interaction.reply('🧠 **Juego de Memoria** - ¡En desarrollo! Próximamente...');
    }

    else if (commandName === 'battle') {
        await interaction.reply('⚔️ **Batalla** - ¡En desarrollo! Próximamente...');
    }
});

// Manejar interacciones de botones y menús
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'join_race') {
            await interaction.reply({ content: '🎯 Te has unido a la carrera!', ephemeral: true });
        }
        else if (['piedra', 'papel', 'tijera'].includes(interaction.customId)) {
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
                const coins = getCoins(interaction.user.id);
                userCoins.set(interaction.user.id, coins + 25);
                updateStats(interaction.user.id, true, 25);
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
                    { name: '🤖 Mi elección', value: `**${botChoice.toUpperCase()}**`, inline: true },
                    { name: '💰 Premio', value: color === 0x00FF00 ? '+25 🪙' : '0 🪙', inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        }
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'game_select') {
            const game = interaction.values[0];
            await interaction.reply({ content: `🎮 Iniciando: **${game}** - Usa \`/${game}\` para jugar!`, ephemeral: true });
        }
        else if (interaction.customId === 'solo_game_select') {
            const game = interaction.values[0];
            
            if (game === 'adivina') {
                const numero = Math.floor(Math.random() * 100) + 1;
                let intentos = 0;
                
                const embed = new EmbedBuilder()
                    .setTitle('🔢 ADIVINA EL NÚMERO')
                    .setDescription('**Estoy pensando en un número del 1 al 100**\n¡Tienes 8 intentos!')
                    .setColor(0x9B59B6)
                    .addFields(
                        { name: '🎯 Intentos', value: '`0/8`', inline: true },
                        { name: '💰 Premio', value: '`50` 🪙', inline: true }
                    )
                    .setFooter({ text: 'Escribe tu número en el chat' });

                await interaction.reply({ embeds: [embed] });
                
                const filter = m => m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, time: 120000, max: 8 });
                
                collector.on('collect', async m => {
                    intentos++;
                    const guess = parseInt(m.content);
                    
                    if (isNaN(guess)) {
                        await m.reply('❌ Escribe un número válido');
                        return;
                    }
                    
                    if (guess === numero) {
                        const coins = getCoins(interaction.user.id);
                        userCoins.set(interaction.user.id, coins + 50);
                        updateStats(interaction.user.id, true, 50);
                        
                        const winEmbed = new EmbedBuilder()
                            .setTitle('🎉 ¡GANASTE!')
                            .setDescription(`**¡Correcto! Era ${numero}**\n\nLo adivinaste en **${intentos}** intentos`)
                            .setColor(0x00FF00)
                            .addFields(
                                { name: '💰 Premio', value: '+50 🪙', inline: true }
                            );
                        
                        await interaction.followUp({ embeds: [winEmbed] });
                        collector.stop();
                    } else if (guess < numero) {
                        await m.reply('📈 **Más alto!**');
                    } else {
                        await m.reply('📉 **Más bajo!**');
                    }
                    
                    if (intentos >= 8 && guess !== numero) {
                        const loseEmbed = new EmbedBuilder()
                            .setTitle('💀 ¡PERDISTE!')
                            .setDescription(`El número era: **${numero}**\n\nMejor suerte la próxima vez`)
                            .setColor(0xFF0000);
                        
                        await interaction.followUp({ embeds: [loseEmbed] });
                        collector.stop();
                    }
                });
            }
            else if (game === 'ppt') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('piedra').setLabel('🪨 Piedra').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('papel').setLabel('📄 Papel').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('tijera').setLabel('✂️ Tijera').setStyle(ButtonStyle.Danger)
                );

                const embed = new EmbedBuilder()
                    .setTitle('🪨 PIEDRA, PAPEL O TIJERA')
                    .setDescription('**Elige tu movimiento:**')
                    .setColor(0xFFA500)
                    .setFooter({ text: '¡Gana 25 🪙 por cada victoria!' });

                await interaction.reply({ embeds: [embed], components: [row] });
            }
        }
    }
});

client.login(config.token);