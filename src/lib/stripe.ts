import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export const fetchSubscriptionByEmail = async (email: string) => {
    const customers = await stripe.customers.list({
        email: email,
        limit: 1,
        expand: ["data"]
    });

    if (customers.data.length === 0) {
        return null;
    }

    const subscription = await stripe.subscriptions.list({
        limit: 1,
        customer: customers.data[0].id
    });

    if (subscription.data.length === 0) {
        return null;
    }

    console.log(subscription.data);

    return {isActive: subscription.data[0]?.status, data: subscription.data[0]};
}