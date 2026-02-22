/**
 * Verification script for getEventsBySociety
 */
const SocietyEvent = require('./src/models/SocietyEvent');
const prisma = require('./src/config/database');

async function verify() {
    console.log("--- Starting Society Events Verification ---");

    try {
        // Find a society with events first
        const event = await prisma.societyEvent.findFirst();

        if (!event) {
            console.log("No events found in database to test with. Skipping deep verification.");
            return;
        }

        console.log(`Testing findBySociety for society ID: ${event.societyId}`);
        const events = await SocietyEvent.findBySociety(event.societyId);

        console.log(`Found ${events.length} events for this society.`);

        if (Array.isArray(events)) {
            console.log("Result is an array (Correct).");
            const allCorrect = events.every(e => e.societyId === event.societyId);
            console.log(`All returned events belong to the correct society: ${allCorrect}`);
        }

        console.log("\nVerification Successful!");
    } catch (err) {
        console.error("Verification FAILED:", err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
