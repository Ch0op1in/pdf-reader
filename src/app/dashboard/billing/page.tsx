import BillingForm from "@/components/billingform"
import { getUserSubscriptionPlan } from "@/lib/stripe"


const BillingPage = async () => {

    const subscriptionPlan = await getUserSubscriptionPlan()

    return (
    <div>
    <BillingForm subscriptionPlan={subscriptionPlan}/>
    </div>)
}

export default BillingPage