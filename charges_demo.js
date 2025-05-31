// Demo: Companies House API Charges Response for GRESHAM HOUSE LIMITED
// Company Number: 03207655

// Example API call structure:
// GET https://api.company-information.service.gov.uk/company/03207655/charges

const exampleChargesResponse = {
  "etag": "7b5bb5d7e25c7b5bb5d7e25c7b5bb5d7e25c7b5b",
  "items": [
    {
      "etag": "5d7e25c7b5bb5d7e25c7b5bb5d7e25c7b5bb5d7e",
      "charge_number": 1,
      "charge_code": "031476210001",
      "classification": "charge-description",
      "charge_description": "DEBENTURE",
      "created_on": "2023-03-15",
      "delivered_on": "2023-03-16",
      "status": "outstanding",
      "acquired_on": "2023-03-15",
      "covering_instrument_date": "2023-03-15",
      "particulars": "All present and future book debts and other debts due or owing to the company and the benefit of any guarantees and other securities thereof and all intellectual property rights of the company",
      "secured_details": {
        "type": "amount-secured-gbp",
        "description": "£50,000,000 and any other moneys that may become owing by the company to the chargee under the terms of the aforementioned instrument creating or evidencing the charge"
      },
      "scottish_alterations": {
        "has_alterations_to_order": false,
        "has_alterations_to_prohibitions": false,
        "has_restricting_provisions": false
      },
      "more_than_four_persons_entitled": false,
      "persons_entitled": [
        {
          "name": "HSBC BANK PLC"
        }
      ],
      "transactions": [
        {
          "delivered_on": "2023-03-16",
          "filing_type": "create-charge-with-deed"
        }
      ],
      "links": {
        "self": "/company/03207655/charges/XuGYrRy5NhiZH_4xQzO-eg8DNMs"
      }
    },
    {
      "etag": "bb5d7e25c7b5bb5d7e25c7b5bb5d7e25c7b5bb5d7",
      "charge_number": 2,
      "charge_code": "031476210002",
      "classification": "charge-description",
      "charge_description": "FLOATING CHARGE",
      "created_on": "2022-09-20",
      "delivered_on": "2022-09-21",
      "status": "satisfied",
      "satisfied_on": "2023-01-15",
      "acquired_on": "2022-09-20",
      "covering_instrument_date": "2022-09-20",
      "particulars": "The whole of the undertaking and all property and assets present and future including goodwill bookdebts uncalled capital buildings fixtures fixed plant and machinery",
      "secured_details": {
        "type": "amount-secured-gbp", 
        "description": "£25,000,000 plus costs, charges, interest and other money (if any)"
      },
      "scottish_alterations": {
        "has_alterations_to_order": false,
        "has_alterations_to_prohibitions": false,
        "has_restricting_provisions": false
      },
      "more_than_four_persons_entitled": false,
      "persons_entitled": [
        {
          "name": "NATWEST BANK PLC"
        }
      ],
      "transactions": [
        {
          "delivered_on": "2022-09-21",
          "filing_type": "create-charge-with-deed"
        },
        {
          "delivered_on": "2023-01-15",
          "filing_type": "satisfy-charge"
        }
      ],
      "links": {
        "self": "/company/03207655/charges/YvHZsUz6OijAI_5yRaP-fh9EONt"
      }
    }
  ],
  "total_count": 2,
  "unfiltered_count": 2,
  "satisfied_count": 1,
  "part_satisfied_count": 0,
  "links": {
    "self": "/company/03207655/charges"
  }
};

// Key data points you can extract:

// 1. CHARGE AMOUNTS (secured_details.description):
const chargeAmounts = [
  "£50,000,000 and any other moneys...", // Outstanding charge
  "£25,000,000 plus costs, charges..." // Satisfied charge  
];

// 2. CHARGE STATUS:
const chargeStatuses = [
  "outstanding", // Active charge
  "satisfied"    // Resolved charge
];

// 3. CHARGE HOLDERS:
const chargeHolders = [
  "HSBC BANK PLC",
  "NATWEST BANK PLC"
];

// 4. CHARGE TYPES:
const chargeTypes = [
  "DEBENTURE",
  "FLOATING CHARGE"
];

// 5. TOTAL SECURED AMOUNT CALCULATION:
function calculateTotalSecured(charges) {
  // Note: Amounts are often in text format with "plus costs" clauses
  // You'd need to parse: "£50,000,000" -> 50000000
  
  let totalOutstanding = 0;
  let totalSatisfied = 0;
  
  charges.items.forEach(charge => {
    const amountText = charge.secured_details?.description || "";
    const amountMatch = amountText.match(/£([\d,]+)/);
    
    if (amountMatch) {
      const amount = parseInt(amountMatch[1].replace(/,/g, ''));
      
      if (charge.status === 'outstanding') {
        totalOutstanding += amount;
      } else if (charge.status === 'satisfied') {
        totalSatisfied += amount;
      }
    }
  });
  
  return {
    totalOutstanding,
    totalSatisfied,
    totalSecured: totalOutstanding + totalSatisfied
  };
}

const summary = calculateTotalSecured(exampleChargesResponse);
console.log('Charge Summary:', summary);
// Output: { totalOutstanding: 50000000, totalSatisfied: 25000000, totalSecured: 75000000 }

// 6. INTEGRATION WITH YOUR CURRENT SYSTEM:
function enhanceCompanyCard(company, chargesData) {
  return {
    ...company,
    // Your existing fields
    totalCharges: chargesData.total_count,
    outstandingCharges: chargesData.total_count - chargesData.satisfied_count,
    satisfiedCharges: chargesData.satisfied_count,
    
    // New enhanced fields with amounts
    totalSecuredAmount: summary.totalSecured,
    outstandingSecuredAmount: summary.totalOutstanding,
    satisfiedSecuredAmount: summary.totalSatisfied,
    
    // Detailed charges for expandable view
    chargeDetails: chargesData.items.map(charge => ({
      number: charge.charge_number,
      amount: charge.secured_details?.description,
      status: charge.status,
      holder: charge.persons_entitled?.[0]?.name,
      type: charge.charge_description,
      date: charge.created_on
    }))
  };
}

module.exports = { exampleChargesResponse, calculateTotalSecured, enhanceCompanyCard };