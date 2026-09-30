const vscode = require('vscode');

const MODERN_UI = 'workbench.experimental.modernUI';
const ENABLE_EXPERIMENTS = 'workbench.enableExperiments';

async function setGlobal(section, value) {
	const config = vscode.workspace.getConfiguration();
	const inspected = config.inspect(section);

	if (inspected?.globalValue === value) {
		return false;
	}

	await config.update(section, value, vscode.ConfigurationTarget.Global);
	return true;
}

async function disableModernUi() {
	const changed = await setGlobal(MODERN_UI, false);

	if (changed) {
		vscode.window.showInformationMessage(
			'Abyssal: Modern UI disabled. Reload the window to drop the tab gaps and rounded corners.'
		);
		return;
	}

	// Already off in user settings, yet the workbench still looks rounded. VS Code
	// gates the toggle behind the experiments channel, so fall back to that.
	await setGlobal(ENABLE_EXPERIMENTS, false);

	vscode.window.showInformationMessage(
		'Abyssal: Modern UI was already disabled but is still active. Disabled experiments and cleared the flag. Reload the window.'
	);
}

function activate() {
	vscode.commands.registerCommand('abyssal.disableModernUi', disableModernUi);
}

function deactivate() {}

module.exports = { activate, deactivate };