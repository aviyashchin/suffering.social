/**
 * Research Citations and Info Popup Content
 * 
 * Research-backed citations and detailed explanations for each parameter.
 * Used to generate info popup content with proper academic references.
 * 
 * @fileoverview Citation and information utilities
 * @version 1.0.0
 */

/**
 * Detailed citation and explanation data for each parameter
 * Based on peer-reviewed research and government sources
 */
export const PARAMETER_CITATIONS = {
  vsl: {
    title: "Value of Statistical Life (VSL)",
    shortDescription: "Government standard for policy cost-benefit analysis",
    detailedDescription: `
      The Value of Statistical Life represents how much society is willing to pay to prevent one statistical death. 
      It's used by government agencies for regulatory cost-benefit analysis and infrastructure decisions.
    `,
    keyFindings: [
      "US Department of Transportation 2024 guidance: $13.7 million",
      "EPA uses $11.2 million (2024 adjusted)",
      "Meta-analysis range: $8M - $20M (Banzhaf 2022)"
    ],
    citations: [
      {
        title: "Revised Departmental Guidance on Valuation of a Statistical Life in Economic Analysis",
        authors: "US Department of Transportation",
        year: 2024,
        journal: "DOT Policy Guidance",
        url: "https://www.transportation.gov/office-policy/transportation-policy/revised-departmental-guidance-on-valuation-of-a-statistical-life-in-economic-analysis",
        note: "Primary US government VSL guidance"
      },
      {
        title: "The Value of a Statistical Life: A Meta-Analysis of Meta-Analyses",
        authors: "H. Spencer Banzhaf",
        year: 2022,
        journal: "Journal of Benefit-Cost Analysis",
        url: "https://doi.org/10.1017/bca.2022.9",
        note: "Comprehensive meta-analysis of VSL estimates"
      }
    ],
    methodology: "Based on revealed preference studies, wage-risk tradeoffs, and contingent valuation surveys",
    uncertainty: "Range reflects different methodologies and country contexts"
  },

  suicides: {
    title: "Excess Suicides Since 2009",
    shortDescription: "Documented increase in suicide rates coinciding with social media adoption",
    detailedDescription: `
      CDC data shows a marked increase in suicide rates, particularly among youth, beginning around 2009-2012 
      when social media became widespread. This represents excess deaths above historical baseline trends.
    `,
    keyFindings: [
      "Youth suicide rates increased 37% from 2000-2022 (CDC)",
      "49,000+ deaths by suicide in US (2023)",
      "Social media timing correlation: 2009-2012 adoption period"
    ],
    citations: [
      {
        title: "Suicide Facts and Figures: 2023 National Statistics",
        authors: "Centers for Disease Control and Prevention",
        year: 2023,
        journal: "CDC National Vital Statistics System",
        url: "https://www.cdc.gov/suicide/facts/index.html",
        note: "Official US suicide statistics"
      },
      {
        title: "Associations between screen time and lower psychological well-being among children and adolescents",
        authors: "Jean M. Twenge, W. Keith Campbell",
        year: 2018,
        journal: "Proceedings of the National Academy of Sciences",
        url: "https://www.pnas.org/doi/pdf/10.1073/pnas.1815663116",
        note: "Large-scale analysis of teen mental health trends"
      }
    ],
    methodology: "CDC WONDER database analysis, trend analysis from 2000-2024",
    uncertainty: "Attribution percentage varies by study methodology"
  },

  attribution: {
    title: "% Attributable to Social Media",
    shortDescription: "Research evidence for causal relationship between social media and mental health",
    detailedDescription: `
      Quasi-experimental studies and natural experiments provide causal evidence that social media 
      contributes to mental health problems. Internal company research confirms these findings.
    `,
    keyFindings: [
      "Facebook rollout increased depression by 7% (Braghieri et al. 2022)",
      "Each hour of social media use → 0.23-point increase in depressive symptoms",
      "Instagram's own research: 'We make body image issues worse' (Facebook Files)"
    ],
    citations: [
      {
        title: "Social Media and Mental Health",
        authors: "Luca Braghieri, Ro'ee Levy, Alexey Makarin",
        year: 2022,
        journal: "American Economic Review",
        url: "https://econpapers.repec.org/RePEc:aea:aecrev:v:112:y:2022:i:11:p:3660-93",
        note: "Gold standard causal evidence using Facebook rollout as natural experiment"
      },
      {
        title: "The Facebook Files",
        authors: "Wall Street Journal Investigation",
        year: 2021,
        journal: "Wall Street Journal",
        url: "https://law.yale.edu/isp/events/facebook-files",
        note: "Internal Facebook research documents"
      }
    ],
    methodology: "Quasi-experimental design, difference-in-differences analysis",
    uncertainty: "Different studies find 5-30% attribution rates depending on population and methodology"
  },

  depression: {
    title: "Americans with SM-Induced Depression",
    shortDescription: "Population estimates based on prevalence studies and causal research",
    detailedDescription: `
      Combining national depression prevalence data with causal attribution research to estimate 
      the number of Americans whose depression is attributable to social media use.
    `,
    keyFindings: [
      "15.8% of teens had major depressive episode (2019) vs 8.1% (2009)",
      "5.2M US teens experienced major depressive episode (2024)",
      "Each hour of social media → 0.23-point increase in symptoms"
    ],
    citations: [
      {
        title: "The State of Mental Health in America: Youth Rankings",
        authors: "Mental Health America",
        year: 2024,
        journal: "Mental Health America Annual Report",
        url: "https://mhanational.org/the-state-of-mental-health-in-america/data-rankings/youth-ranking/",
        note: "National youth mental health statistics"
      },
      {
        title: "National Survey on Drug Use and Health",
        authors: "SAMHSA",
        year: 2021,
        journal: "NSDUH Annual Report",
        url: "https://www.samhsa.gov/data/report/2021-nsduh-annual-national-report",
        note: "National mental health prevalence data"
      }
    ],
    methodology: "Population prevalence × causal attribution percentage",
    uncertainty: "Range reflects uncertainty in both prevalence and attribution"
  },

  yld: {
    title: "Years Lived with Disability (YLD)",
    shortDescription: "WHO methodology for quantifying disease burden",
    detailedDescription: `
      Years Lived with Disability measures the health impact of living with depression. 
      Based on WHO Global Burden of Disease methodology used worldwide for health policy.
    `,
    keyFindings: [
      "Depression: 4-8 years average duration per episode",
      "Chronic depression can last decades",
      "Early onset (teen years) = longer lifetime burden"
    ],
    citations: [
      {
        title: "Global Burden of Disease Study: Disability-Adjusted Life Years",
        authors: "World Health Organization",
        year: 2019,
        journal: "WHO Global Health Observatory",
        url: "https://www.who.int/healthinfo/global_burden_disease/metrics_daly/en/",
        note: "Official WHO DALY/YLD methodology"
      },
      {
        title: "Depression as a global public health concern",
        authors: "Kessler et al.",
        year: 2019,
        journal: "International Journal of Mental Health",
        url: "https://econtent.hogrefe.com/doi/10.1027/1864-1105/a000227",
        note: "Global depression burden analysis"
      }
    ],
    methodology: "WHO GBD methodology, epidemiological studies",
    uncertainty: "Varies by severity, treatment access, and individual factors"
  },

  qol: {
    title: "Quality of Life Reduction",
    shortDescription: "Depression's impact on life satisfaction and functioning",
    detailedDescription: `
      Depression significantly reduces quality of life across multiple domains: work, relationships, 
      physical health, and overall life satisfaction. Used in QALY calculations.
    `,
    keyFindings: [
      "Major depression reduces QoL by 30-40% (WHO studies)",
      "Impacts work productivity, relationships, physical health",
      "Early treatment can restore much of the quality loss"
    ],
    citations: [
      {
        title: "Global Burden of Disease Study: Quality-Adjusted Life Years",
        authors: "World Health Organization",
        year: 2019,
        journal: "WHO Global Health Observatory",
        url: "https://www.who.int/healthinfo/global_burden_disease/metrics_daly/en/",
        note: "Standard QALY methodology for depression"
      }
    ],
    methodology: "Standard gamble, time trade-off, and rating scale methods",
    uncertainty: "Individual variation in depression severity and impact"
  },

  healthcare: {
    title: "Annual Healthcare Costs",
    shortDescription: "Direct medical costs of depression treatment",
    detailedDescription: `
      Direct healthcare costs include therapy, medication, hospitalization, and emergency care. 
      Based on comprehensive economic burden studies of depression in the United States.
    `,
    keyFindings: [
      "Depression costs $282B annually to US economy (Yale 2024)",
      "$6,500-$8,000 per person per year (treatment costs)",
      "Many patients receive inadequate treatment"
    ],
    citations: [
      {
        title: "Economic burden of adults with major depressive disorder in the United States",
        authors: "Paul E. Greenberg et al.",
        year: 2021,
        journal: "Journal of Clinical Psychiatry",
        url: "https://www.psychiatrist.com/jcp/economic-burden-adults-major-depressive-disorder-united/",
        note: "Comprehensive US depression cost analysis"
      },
      {
        title: "Novel study quantifies immense economic costs of mental illness in US",
        authors: "Yale University",
        year: 2024,
        journal: "Yale News",
        url: "https://news.yale.edu/2024/04/22/novel-study-quantifies-immense-economic-costs-mental-illness-us",
        note: "Recent large-scale economic impact study"
      }
    ],
    methodology: "Claims data analysis, treatment cost surveys",
    uncertainty: "Varies by treatment intensity, insurance coverage, and geographic location"
  },

  productivity: {
    title: "Annual Productivity Loss",
    shortDescription: "Lost work productivity due to depression",
    detailedDescription: `
      Depression causes significant workplace productivity losses through absenteeism, 
      presenteeism (reduced performance while at work), and disability. Workplace costs 
      represent 50-61% of total depression economic burden.
    `,
    keyFindings: [
      "Workers with depression miss 12 days annually vs 2.5 for others",
      "Productivity losses: $47.6B annually in US",
      "61% of total depression burden is workplace-related"
    ],
    citations: [
      {
        title: "The growing burden of major depressive disorders (MDD): implications for researchers and policy makers",
        authors: "König et al.",
        year: 2021,
        journal: "PharmacoEconomics",
        url: "https://link.springer.com/content/pdf/10.1007/s40273-021-01019-4.pdf",
        note: "Global analysis of depression economic burden"
      },
      {
        title: "State of the Global Workplace",
        authors: "Gallup",
        year: 2023,
        journal: "Gallup Workplace Report",
        url: "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx",
        note: "Workplace productivity and mental health data"
      }
    ],
    methodology: "Workplace surveys, human capital approach, disability claims analysis",
    uncertainty: "Varies by job type, severity of depression, and workplace accommodations"
  },

  duration: {
    title: "Treatment Duration",
    shortDescription: "Average length of depression treatment and recovery",
    detailedDescription: `
      Depression treatment duration varies widely but chronic cases often require 
      years of treatment. Early intervention can reduce overall duration and costs.
    `,
    keyFindings: [
      "Chronic depression: 4-6 years average treatment",
      "Early intervention reduces long-term costs",
      "Social media-induced depression may have different duration patterns"
    ],
    citations: [
      {
        title: "Preventive Services Task Force: Depression Screening",
        authors: "American Journal of Preventive Medicine",
        year: 2024,
        journal: "AJPM",
        url: "https://www.ajpmonline.org/article/S0749-3797(24)00022-9/pdf",
        note: "Prevention and early intervention evidence"
      }
    ],
    methodology: "Longitudinal studies, treatment registry data",
    uncertainty: "Highly variable based on individual factors and treatment access"
  }
};

/**
 * Generate formatted citation text
 * @param {Object} citation - Citation object
 * @returns {string} Formatted citation
 */
export function formatCitation(citation) {
  return `${citation.authors} (${citation.year}). ${citation.title}. ${citation.journal}.`;
}

/**
 * Get popup content for a parameter
 * @param {string} parameterKey - Parameter key
 * @returns {Object} Popup content with title, description, citations
 */
export function getParameterPopupContent(parameterKey) {
  const data = PARAMETER_CITATIONS[parameterKey];
  if (!data) {
    console.warn(`Citation data not found for parameter: ${parameterKey}`);
    return null;
  }

  return {
    title: data.title,
    shortDescription: data.shortDescription,
    detailedDescription: data.detailedDescription,
    keyFindings: data.keyFindings,
    citations: data.citations.map(formatCitation),
    methodology: data.methodology,
    uncertainty: data.uncertainty,
    rawCitations: data.citations // For linking
  };
}

/**
 * Generate HTML content for info popup
 * @param {string} parameterKey - Parameter key
 * @returns {string} HTML content for popup
 */
export function generatePopupHTML(parameterKey) {
  const content = getParameterPopupContent(parameterKey);
  if (!content) return '<p>No information available</p>';

  let html = `
    <div class="info-popup-content">
      <h3 class="text-lg font-bold mb-2 text-gray-800">${content.title}</h3>
      <p class="text-sm text-gray-600 mb-3">${content.shortDescription}</p>
      
      <div class="mb-3">
        <h4 class="font-semibold text-gray-700 mb-1">Key Findings:</h4>
        <ul class="text-xs text-gray-600 list-disc ml-4">
  `;

  content.keyFindings.forEach(finding => {
    html += `<li>${finding}</li>`;
  });

  html += `
        </ul>
      </div>
      
      <div class="mb-3">
        <h4 class="font-semibold text-gray-700 mb-1">Research Sources:</h4>
        <div class="text-xs text-gray-600 space-y-1">
  `;

  content.rawCitations.forEach(citation => {
    const linkText = citation.url ? 
      `<a href="${citation.url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">${formatCitation(citation)}</a>` :
      formatCitation(citation);
    html += `<div>${linkText}</div>`;
  });

  html += `
        </div>
      </div>
      
      <div class="text-xs text-gray-500">
        <strong>Methodology:</strong> ${content.methodology}
      </div>
    </div>
  `;

  return html;
} 