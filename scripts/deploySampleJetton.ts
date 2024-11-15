import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { buildOnchainMetadata } from '../utils/jetton-helpers';
import { SampleJetton } from '../wrappers/SampleJetton';

export async function run(provider: NetworkProvider) {
    console.log(provider.network());
    const jettonParams = {
        name: 'SCUM Token',
        description: "You've been scummed, loser",
        symbol: 'SCUM',
        image: '',
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);

    // Deploy the SampleJetton contract
    const sampleJetton = provider.open(
        await SampleJetton.fromInit(
            provider.sender().address as Address,
            content,
            1000000000000000000n, // Set max_supply
        ),
    );

    // Send the initial transaction to deploy the contract
    await sampleJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'), // Deployment value
        },
        {
            $$type: 'Mint',
            amount: 100000000000000000n, // Initial mint amount
            receiver: provider.sender().address as Address, // Receiver address
        },
    );

    // Wait for the contract to deploy
    await provider.waitForDeploy(sampleJetton.address);

    console.log(`SampleJetton deployed at address: ${sampleJetton.address}`);
}
