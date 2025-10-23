const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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

const commands = [
    new SlashCommandBuilder().setName('carrera').setDescription('🎪 Carrera tipo Fall Guys'),
    new SlashCommandBuilder().setName('impostor').setDescription('🕵️ Juego tipo Among Us'),
    new SlashCommandBuilder().setName('dibuja').setDescription('🎨 Juego de dibujar y adivinar'),
    new SlashCommandBuilder().setName('party').setDescription('🎪 Selecciona un minijuego aleatorio'),
    new SlashCommandBuilder().setName('trivia').setDescription('🧠 Trivia rápida'),
    new SlashCommandBuilder().setName('ruleta').setDescription('🎰 Ruleta rusa'),
    new SlashCommandBuilder().setName('memoria').setDescription('🧠 Juego de memoria')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
        console.log('✅ Slash commands registrados!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();

client.once('ready', () => {
    console.log(`🎮 ${client.user.tag} listo!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'carrera') {
        const embed = new EmbedBuilder()
            .setTitle('🎪 CARRERA BEST PARTY')
            .setDescription('¡Reacciona con 🏃 para unirte a la carrera!')
            .setColor(0x00FF00)
            .setFooter({ text: 'Tienes 15 segundos para unirte' });

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
            
            const resultEmbed = new EmbedBuilder()
                .setTitle('🏁 RESULTADOS DE LA CARRERA')
                .setDescription(progress.join('\n'))
                .addFields({ name: '🎉 GANADOR', value: `${winner.username}` })
                .setColor(0xFFD700)
                .setThumbnail('https://emoji.discord.st/emojis/trophy.png');

            await interaction.followUp({ embeds: [resultEmbed] });
        }, 15000);
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

        setTimeout(async () => {
            const reaction = message.reactions.cache.get('✅');
            const users = await reaction.users.fetch();
            const players = users.filter(user => !user.bot);
            
            if (players.size < 3) {
                await interaction.followUp('❌ Se necesitan al menos 3 jugadores');
                return;
            }

            const playerArray = Array.from(players.values());
            const impostor = playerArray[Math.floor(Math.random() * playerArray.length)];
            
            for (const player of playerArray) {
                try {
                    const roleEmbed = new EmbedBuilder()
                        .setTitle('🎭 TU ROL')
                        .setColor(player.id === impostor.id ? 0xFF0000 : 0x00FF00)
                        .setDescription(player.id === impostor.id ? 
                            '**👹 ERES EL IMPOSTOR**\nSabotea sin que te descubran!' : 
                            '**👨‍🚀 ERES TRIPULANTE**\nEncuentra al impostor!');
                    
                    await player.send({ embeds: [roleEmbed] });
                } catch (error) {}
            }

            const gameEmbed = new EmbedBuilder()
                .setTitle('🎮 JUEGO INICIADO')
                .setDescription(`**Jugadores:** ${playerArray.map(p => p.username).join(', ')}\n\n💬 Discutan y voten al impostor!`)
                .setColor(0x0099FF)
                .setFooter({ text: `El impostor era... ${impostor.username}` });

            await interaction.followUp({ embeds: [gameEmbed] });
        }, 20000);
    }

    else if (commandName === 'dibuja') {
        const palabras = ['🐉 dragón', '🍦 helado', '📞 teléfono', '🚲 bicicleta', '🔥 fuego', '🏠 casa', '🐱 gato', '🌞 sol', '🎮 videojuego', '🍕 pizza'];
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('🎨 DIBUJA Y ADIVINA')
                .setDescription(`Tu palabra es: **||${palabra}||**\n\nDescríbela con emojis o texto en el canal!`)
                .setColor(0xFFA500);
            
            await interaction.user.send({ embeds: [dmEmbed] });
            
            const publicEmbed = new EmbedBuilder()
                .setTitle('🎨 ALGUIEN ESTÁ DIBUJANDO...')
                .setDescription(`**${interaction.user.username}** está dibujando algo\n¡Adivinen qué es!`)
                .setColor(0xFFA500)
                .setFooter({ text: '60 segundos para adivinar' });
            
            await interaction.reply({ embeds: [publicEmbed] });

            setTimeout(async () => {
                const revealEmbed = new EmbedBuilder()
                    .setTitle('🕒 TIEMPO AGOTADO')
                    .setDescription(`La palabra era: **${palabra}**`)
                    .setColor(0x666666);
                
                await interaction.followUp({ embeds: [revealEmbed] });
            }, 60000);
            
        } catch (error) {
            await interaction.reply('❌ No puedo enviarte MD. Activa tus mensajes directos.');
        }
    }

    else if (commandName === 'party') {
        const juegos = [
            { name: '🎯 CARRERA OBSTÁCULOS', value: 'Usa `/carrera`' },
            { name: '🕵️ ENCUENTRA AL IMPOSTOR', value: 'Usa `/impostor`' },
            { name: '🎨 DIBUJA Y ADIVINA', value: 'Usa `/dibuja`' },
            { name: '🧠 TRIVIA RÁPIDA', value: 'Usa `/trivia`' },
            { name: '🎰 RULETA RUSA', value: 'Usa `/ruleta`' },
            { name: '🧠 JUEGO DE MEMORIA', value: 'Usa `/memoria`' }
        ];
        
        const juego = juegos[Math.floor(Math.random() * juegos.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🎪 BEST PARTY RANDOM')
            .setDescription(`**¡JUEGO SELECCIONADO!**\n\n**${juego.name}**\n${juego.value}`)
            .setColor(0x9B59B6)
            .setThumbnail('https://emoji.discord.st/emojis/game_die.png')
            .setFooter({ text: '¡Diversión asegurada!' });

        await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'trivia') {
        const preguntas = [
            { pregunta: "¿Capital de Japón?", respuesta: "tokio", opciones: ["Seúl", "Tokio", "Pekín"] },
            { pregunta: "¿2+2?", respuesta: "4", opciones: ["3", "4", "5"] },
            { pregunta: "¿Color del cielo?", respuesta: "azul", opciones: ["Rojo", "Azul", "Verde"] },
            { pregunta: "¿Animal que dice 'miau'?", respuesta: "gato", opciones: ["Perro", "Gato", "Pájaro"] },
            { pregunta: "¿Planeta rojo?", respuesta: "marte", opciones: ["Venus", "Marte", "Júpiter"] }
        ];
        
        const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('a')
                    .setLabel(pregunta.opciones[0])
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('b')
                    .setLabel(pregunta.opciones[1])
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('c')
                    .setLabel(pregunta.opciones[2])
                    .setStyle(ButtonStyle.Primary)
            );

        const embed = new EmbedBuilder()
            .setTitle('🧠 TRIVIA RÁPIDA')
            .setDescription(`**${pregunta.pregunta}**\n\nTienes 15 segundos para responder!`)
            .setColor(0x3498DB)
            .setFooter({ text: 'Usa los botones para responder' });

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.isButton();
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const selected = pregunta.opciones[['a', 'b', 'c'].indexOf(i.customId)];
            if (selected === pregunta.respuesta) {
                await i.reply(`🎉 **${i.user.username} GANA!** Respuesta correcta: ${pregunta.respuesta}`);
                collector.stop();
            } else {
                await i.reply({ content: '❌ Incorrecto!', ephemeral: true });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.followUp(`⏰ **TIEMPO AGOTADO!** La respuesta era: ${pregunta.respuesta}`);
            }
        });
    }

    else if (commandName === 'ruleta') {
        const participantes = [interaction.user];
        const balas = 6;
        const balaMortifera = Math.floor(Math.random() * balas) + 1;
        let turno = 0;
        
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

            let jugadorActual = 0;
            const resultados = [];

            for (let disparo = 1; disparo <= balas; disparo++) {
                const jugador = participantes[jugadorActual];
                
                if (disparo === balaMortifera) {
                    resultados.push(`💀 **${jugador.username}** recibió el disparo mortal!`);
                    break;
                } else {
                    resultados.push(`✅ **${jugador.username}** sobrevivió al disparo ${disparo}`);
                }
                
                jugadorActual = (jugadorActual + 1) % participantes.length;
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle('💀 RESULTADO RULETA RUSA')
                .setDescription(resultados.join('\n'))
                .setColor(0x8B0000)
                .setFooter({ text: `${participantes.length} jugadores participaron` });

            await interaction.followUp({ embeds: [resultEmbed] });
        }, 15000);
    }

    else if (commandName === 'memoria') {
        const emojis = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍋', '🍉', '🍓'];
        const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        
        let tablero = '```\n';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                tablero += '❓ ';
            }
            tablero += '\n';
        }
        tablero += '```';

        const embed = new EmbedBuilder()
            .setTitle('🧠 JUEGO DE MEMORIA')
            .setDescription(`Encuentra las parejas!\n${tablero}`)
            .setColor(0x8E44AD)
            .setFooter({ text: 'Próximamente: sistema de selección interactivo' });

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(config.token);