import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ApplicationIntegrationType, EmbedBuilder, InteractionContextType, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Ping the bot to check latency.'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
		const contexts: InteractionContextType[] = [
			InteractionContextType.BotDM,
			InteractionContextType.Guild,
			InteractionContextType.PrivateChannel
		];

		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
			integrationTypes,
			contexts
		});
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.Message,
			integrationTypes,
			contexts
		});
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.User,
			integrationTypes,
			contexts
		});
	}

	public override async messageRun(message: Message) {
		return this.sendPing(message);
	}
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendPing(interaction);
	}
	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.sendPing(interaction);
	}

	private async sendPing(interactionOrMessage: Message | Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
		const pingMessage =
			interactionOrMessage instanceof Message
				? interactionOrMessage.channel?.isSendable() && (await interactionOrMessage.channel.send({ content: '<a:Loading:1400601825702580334>' }))
				: await interactionOrMessage.reply({ content: '<a:Loading:846571474268586015>' });

		if (!pingMessage) return;

		const PingEmbed = new EmbedBuilder()
			.setColor(0x36373E)
			.setTitle('Pong! 🏓')
			.addFields(
				{ name: 'Bot Latency ', value: `\`\`\`ini\n [ ${pingMessage.createdTimestamp - interactionOrMessage.createdTimestamp}ms ] \n\`\`\``, inline: true },
				{ name: 'API Latency', value: `\`\`\`ini\n [ ${Math.round(this.container.client.ws.ping)}ms ] \n\`\`\``, inline: true }
			);

		if(this.container.client.user?.displayAvatarURL()){
			PingEmbed.setThumbnail(this.container.client.user.displayAvatarURL());
		}

		if (interactionOrMessage instanceof Message) {
			return pingMessage.edit({ embeds: [PingEmbed], content: null });
		}

		return interactionOrMessage.editReply({
			embeds: [PingEmbed],
			content: null
		});
	}
}
