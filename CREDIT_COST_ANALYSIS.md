# Credit Cost Analysis for Opie AI

## 1. AI Chat (Assistant)

The AI chat feature uses a mix of models, so we need to create a blended cost model. We'll use a "credit" system to abstract the underlying costs.

**Cost per 1,000,000 tokens (USD):**

| Model | Provider | Input | Output |
| :--- | :--- | :--- | :--- |
| **Simple Tasks** | | | |
| GPT-5 nano | OpenAI | $0.050 | $0.400 |
| Gemini 3 Pro Preview | Google | $2.00 | $12.00 |
| **Complex Tasks** | | | |
| GPT-5.1 | OpenAI | $1.250 | $10.000 |

**Credit Calculation:**

To simplify the pricing for our users, we'll create a single "credit" unit that represents a certain amount of value. Let's set **1,000 credits = $1.00 USD**.

Now, let's calculate the cost in credits for each model:

| Model | Provider | Input Credits (per 1M tokens) | Output Credits (per 1M tokens) |
| :--- | :--- | :--- | :--- |
| **Simple Tasks** | | | |
| GPT-5 nano | OpenAI | 50 | 400 |
| Gemini 3 Pro Preview | Google | 2,000 | 12,000 |
| **Complex Tasks** | | | |
| GPT-5.1 | OpenAI | 1,250 | 10,000 |

We can then charge a different number of credits for "simple" vs. "complex" chat interactions.

## 2. Vault File Storage (GCS)

Google Cloud Storage pricing is based on data storage, operations, and network usage.

*   **Standard Storage:** ~$0.020 per GB-month
*   **Operations:** ~$0.005 per 1,000 operations
*   **Network Egress:** ~$0.12 per GB

**Credit Calculation:**

*   **Storage:** 20 credits per GB-month
*   **Operations:** 5 credits per 1,000 operations
*   **Egress:** 120 credits per GB

## 3. Advanced Document Analysis (Reducto)

We'll model our costs based on Reducto's credit system, but we'll present a simplified, fixed price to our users.

*   **Standard Page:** 1 Reducto credit
*   **Complex Page:** 2 Reducto credits

Reducto charges $0.015 per credit, so:

*   **Standard Page Cost:** $0.015
*   **Complex Page Cost:** $0.030

**Credit Calculation:**

*   **Standard Page:** 15 credits
*   **Complex Page:** 30 credits

We can offer a "per-page" price to our users, while accounting for the variable cost on the backend.

## 4. Workflows (Temporal)

Temporal's pricing is based on "Actions" and storage.

*   **Actions:** $50 per 1,000,000 actions
*   **Active Storage:** $0.042 per GBh
*   **Retained Storage:** $0.00105 per GBh

**Credit Calculation:**

*   **Actions:** 0.05 credits per action
*   **Active Storage:** 42 credits per GBh
*   **Retained Storage:** 1.05 credits per GBh

The cost of a workflow will depend on its complexity and duration. We can create different credit charges for simple vs. complex workflows.
