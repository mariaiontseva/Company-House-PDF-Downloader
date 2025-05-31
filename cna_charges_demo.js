// Demo: Companies House API Charges Response for CNA INSURANCE COMPANY LIMITED
// Company Number: 01158622

// Example API call structure:
// GET https://api.company-information.service.gov.uk/company/01158622/charges

const cnaChargesResponse = {
  "etag": "8c6cc6e8f36d8c6cc6e8f36d8c6cc6e8f36d8c6c",
  "items": [
    {
      "etag": "6e8f36d8c6cc6e8f36d8c6cc6e8f36d8c6cc6e8f",
      "charge_number": 1,
      "charge_code": "011586220001",
      "classification": "charge-description",
      "charge_description": "DEBENTURE",
      "created_on": "2023-06-10",
      "delivered_on": "2023-06-12",
      "status": "outstanding",
      "acquired_on": "2023-06-10",
      "covering_instrument_date": "2023-06-10",
      "particulars": "All present and future book debts and other debts due or owing to the company together with the benefit of any guarantees and other securities for the same and all intellectual property rights of the company",
      "secured_details": {
        "type": "amount-secured-gbp",
        "description": "£150,000,000 and any other moneys that may become owing by the company to the chargee under the terms of the aforementioned instrument creating or evidencing the charge"
      },
      "scottish_alterations": {
        "has_alterations_to_order": false,
        "has_alterations_to_prohibitions": false,
        "has_restricting_provisions": false
      },
      "more_than_four_persons_entitled": false,
      "persons_entitled": [
        {
          "name": "CONTINENTAL CASUALTY COMPANY"
        }
      ],
      "transactions": [
        {
          "delivered_on": "2023-06-12",
          "filing_type": "create-charge-with-deed"
        }
      ],
      "links": {
        "self": "/company/01158622/charges/ZwIatzS7PkjBJ_6zSbQ-gh0FPOu"
      }
    },
    {
      "etag": "cc6e8f36d8c6cc6e8f36d8c6cc6e8f36d8c6cc6e8",
      "charge_number": 2,
      "charge_code": "011586220002",
      "classification": "charge-description",
      "charge_description": "FLOATING CHARGE",
      "created_on": "2022-11-15",
      "delivered_on": "2022-11-16",
      "status": "outstanding",
      "acquired_on": "2022-11-15",
      "covering_instrument_date": "2022-11-15",
      "particulars": "The whole of the undertaking and all property and assets present and future including goodwill bookdebts uncalled capital buildings fixtures fixed plant and machinery intellectual property and the proceeds of sale thereof",
      "secured_details": {
        "type": "amount-secured-gbp",
        "description": "£75,000,000 plus costs, charges, interest and other money (if any)"
      },
      "scottish_alterations": {
        "has_alterations_to_order": false,
        "has_alterations_to_prohibitions": false,
        "has_restricting_provisions": false
      },
      "more_than_four_persons_entitled": false,
      "persons_entitled": [
        {
          "name": "BARCLAYS BANK PLC"
        }
      ],
      "transactions": [
        {
          "delivered_on": "2022-11-16",
          "filing_type": "create-charge-with-deed"
        }
      ],
      "links": {
        "self": "/company/01158622/charges/AxJdbuT8QlkCK_7aTcR-hi1GQPv"
      }
    },
    {
      "etag": "e8f36d8c6cc6e8f36d8c6cc6e8f36d8c6cc6e8f3",
      "charge_number": 3,
      "charge_code": "011586220003",
      "classification": "charge-description",
      "charge_description": "LEGAL MORTGAGE",
      "created_on": "2021-08-20",
      "delivered_on": "2021-08-21",
      "status": "satisfied",
      "satisfied_on": "2023-02-10",
      "acquired_on": "2021-08-20",
      "covering_instrument_date": "2021-08-20",
      "particulars": "F/H property k/a 1 Aldgate, London EC3N 1RE t/no EGL123456",
      "secured_details": {
        "type": "amount-secured-gbp",
        "description": "£25,000,000"
      },
      "scottish_alterations": {
        "has_alterations_to_order": false,
        "has_alterations_to_prohibitions": false,
        "has_restricting_provisions": false
      },
      "more_than_four_persons_entitled": false,
      "persons_entitled": [
        {
          "name": "LLOYDS BANK PLC"
        }
      ],
      "transactions": [
        {
          "delivered_on": "2021-08-21",
          "filing_type": "create-charge-with-deed"
        },
        {
          "delivered_on": "2023-02-10",
          "filing_type": "satisfy-charge"
        }
      ],
      "links": {
        "self": "/company/01158622/charges/ByKecvU9RmlDL_8bUdS-ij2HRQw"
      }
    }
  ],
  "total_count": 3,
  "unfiltered_count": 3,
  "satisfied_count": 1,
  "part_satisfied_count": 0,
  "links": {
    "self": "/company/01158622/charges"
  }
};

// Key data points for CNA INSURANCE COMPANY LIMITED:

// 1. CHARGE AMOUNTS (secured_details.description):
const cnaChargeAmounts = [
  "£150,000,000 and any other moneys...", // Outstanding debenture
  "£75,000,000 plus costs, charges...",   // Outstanding floating charge
  "£25,000,000"                           // Satisfied legal mortgage
];

// 2. CHARGE STATUS BREAKDOWN:
const cnaChargeStatuses = [
  "outstanding", // £150M debenture
  "outstanding", // £75M floating charge  
  "satisfied"    // £25M legal mortgage (satisfied 2023-02-10)
];

// 3. CHARGE HOLDERS:
const cnaChargeHolders = [
  "CONTINENTAL CASUALTY COMPANY", // Parent company charge
  "BARCLAYS BANK PLC",            // Banking facility
  "LLOYDS BANK PLC"               // Property mortgage (satisfied)
];

// 4. CHARGE TYPES:
const cnaChargeTypes = [
  "DEBENTURE",      // General business charge
  "FLOATING CHARGE", // Asset-based facility
  "LEGAL MORTGAGE"   // Property-specific charge
];

// 5. TOTAL SECURED AMOUNT CALCULATION FOR CNA:
function calculateCNASecured(charges) {
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

const cnaSummary = calculateCNASecured(cnaChargesResponse);
console.log('CNA Charge Summary:', cnaSummary);
// Output: { totalOutstanding: 225000000, totalSatisfied: 25000000, totalSecured: 250000000 }

// 6. COMPARISON WITH GRESHAM HOUSE:
const companyComparison = {
  "GRESHAM HOUSE LIMITED": {
    totalSecured: "£75,000,000",
    outstanding: "£50,000,000", 
    satisfied: "£25,000,000",
    chargeCount: 2
  },
  "CNA INSURANCE COMPANY LIMITED": {
    totalSecured: "£250,000,000",
    outstanding: "£225,000,000",
    satisfied: "£25,000,000", 
    chargeCount: 3
  }
};

// 7. ENHANCED COMPANY CARD FOR CNA:
function enhanceCNACompanyCard(company, chargesData) {
  return {
    ...company,
    // Your existing fields
    totalCharges: chargesData.total_count, // 3
    outstandingCharges: chargesData.total_count - chargesData.satisfied_count, // 2
    satisfiedCharges: chargesData.satisfied_count, // 1
    
    // New enhanced fields with amounts
    totalSecuredAmount: cnaSummary.totalSecured, // £250,000,000
    outstandingSecuredAmount: cnaSummary.totalOutstanding, // £225,000,000
    satisfiedSecuredAmount: cnaSummary.totalSatisfied, // £25,000,000
    
    // Risk indicators (high amounts)
    securityRiskLevel: cnaSummary.totalOutstanding > 100000000 ? "HIGH" : "MEDIUM",
    
    // Detailed charges for expandable view
    chargeDetails: chargesData.items.map(charge => ({
      number: charge.charge_number,
      amount: charge.secured_details?.description,
      status: charge.status,
      holder: charge.persons_entitled?.[0]?.name,
      type: charge.charge_description,
      date: charge.created_on,
      satisfiedDate: charge.satisfied_on || null
    }))
  };
}

module.exports = { cnaChargesResponse, calculateCNASecured, enhanceCNACompanyCard, companyComparison };