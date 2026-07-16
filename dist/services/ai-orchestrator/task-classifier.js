const CLASSIFY_PATTERNS = [
    {
        taskType: 'coding',
        weight: 1.0,
        patterns: [
            /\b(code|program|function|class|algorithm|implement|debug|refactor|api|endpoint|route|middleware|database|sql|query|typescript|javascript|python|go\s|rust\s|java\b|\.tsx?\b|\.jsx?\b|\.py\b|\.go\b|\.rs\b|component|hook|composable|store|state\smanagement)\b/i,
            /\b(write\sa\sfunction|create\sa\smodule|build\san?\sapi|fix\sthis\sbug|optimize\sthis|add\stypescript|migrate\s|deploy\s|docker|kubernetes|ci\/cd|pipeline)\b/i
        ]
    },
    {
        taskType: 'reasoning',
        weight: 1.0,
        patterns: [
            /\b(analyze|reason|think|conclude|evaluate|compare|contrast|diagnose|audit|why\s|how\sdoes|explain\sthe|understand|interpret|infer|deduce|derive)\b/i,
            /\b(what\sis\sthe\scause|what\swould\shappen|determine\swhether|assess\sthe|should\sI|is\sit\sbetter)\b/i
        ]
    },
    {
        taskType: 'workflow',
        weight: 1.0,
        patterns: [
            /\b(workflow|n8n|automation|trigger|node|webhook|action|connection|integration|pipedream|zapier|make\.com|appsmith|retool)\b/i,
            /\b(create\san?\sworkflow|build\san?\sautomation|connect\sto\s|sync\sdata|schedule\sa\sjob|orchestrat)\b/i
        ]
    },
    {
        taskType: 'planning',
        weight: 0.9,
        patterns: [
            /\b(plan|roadmap|strategy|milestone|timeline|sprint|backlog|priority|phase|step-by-step|outline|blueprint|architecture)\b/i,
            /\b(how\sshould\sI\sapproach|what\sare\sthe\ssteps|create\sa\splan\sfor|design\sa\ssolution)\b/i
        ]
    },
    {
        taskType: 'vision',
        weight: 1.0,
        patterns: [
            /\b(image|photo|picture|video|vision|detect|recognize|visual|screenshot|ocr|object\sdetection|face\s|scene\s|caption|diagram|chart|graph|render)\b/i,
            /\b(what\scan\syou\ssee|analyze\sthis\simage|describe\sthe\spicture|generate\san?\simage)\b/i
        ]
    },
    {
        taskType: 'voice',
        weight: 0.9,
        patterns: [
            /\b(voice|speech|audio|transcribe|speak|listen|pronounce|dictate|narration|tts|stt|recording)\b/i,
            /\b(convert\sspeech|text-to-speech|speech-to-text|audio\sfile|call\s|phone)\b/i
        ]
    },
    {
        taskType: 'writing',
        weight: 0.8,
        patterns: [
            /\b(write|draft|compose|edit|rewrite|proofread|grammar|style|tone|essay|article|blog|newsletter|email|memo|letter|story|novel|script)\b/i,
            /\b(improve\sthis\stext|make\sthis\smore|write\san?\s|create\sa\scontent|copywriting)\b/i
        ]
    },
    {
        taskType: 'summarization',
        weight: 1.0,
        patterns: [
            /\b(summarize|summary|tl;dr|recap|condense|synopsis|brief|abstract|key\spoints|main\sideas|gist|overview)\b/i,
            /\b(make\sthis\sshorter|give\sme\sthe\sessentials|extract\sthe\s|reduce\sthis\sto)\b/i
        ]
    },
    {
        taskType: 'translation',
        weight: 1.0,
        patterns: [
            /\b(translate|translation|interpret|convert\sto\s|in\s(language|spanish|french|german|chinese|japanese|korean|arabic|portuguese|russian|italian|dutch))\b/i,
            /\b(how\sdo\syou\ssay|what\sis\sthe\sword\sfor|traduire|übersetzen|traducir)\b/i
        ]
    },
    {
        taskType: 'analysis',
        weight: 0.9,
        patterns: [
            /\b(analytics|metrics|kpi|dashboard|report|statistics|data\s|dataset|trend|pattern|insight|correlation|regression|forecast|predict)\b/i,
            /\b(analyze\sthis\sdata|perform\san?\sanalysis|crunch\sthe\snumbers|evaluate\sthe\sresults)\b/i
        ]
    },
    {
        taskType: 'chat',
        weight: 0.6,
        patterns: [
            /\b(hello|hi\s|hey|greetings|how\sare\syou|what's\sup|nice\sto\smeet|general\schat|small\stalk|conversation)\b/i,
            /^[^!?.]{0,50}\??$/i
        ]
    },
    {
        taskType: 'content_writing',
        weight: 0.9,
        patterns: [
            /\b(content|seo|landing\spage|web\scopy|headline|tagline|cta|call\sto\saction|landing|homepage|about\sus|product\sdescription)\b/i,
            /\b(write\scontent\sfor|create\sa\slanding|optimize\sfor\sseo|generate\sleads|conversion\scopy)\b/i
        ]
    },
    {
        taskType: 'marketing',
        weight: 0.9,
        patterns: [
            /\b(marketing|campaign|ad\s|advertisement|promotion|social\smedia|facebook|instagram|linkedin|twitter|tiktok|pinterest|google\sads)\b/i,
            /\b(marketing\sstrategy|brand|branding|audience|segmentation|target\s|cpc|cpm|roi|conversion\srate)\b/i
        ]
    },
    {
        taskType: 'sales',
        weight: 0.9,
        patterns: [
            /\b(sales|sell|pitch|proposal|negotiation|closing|lead\s|cold\semail|outreach|prospect|qualified|pipeline|revenue|quote|invoice)\b/i,
            /\b(sales\sstrategy|increase\ssales|sales\sfunnel|upsell|cross-sell|objection|follow-up)\b/i
        ]
    },
    {
        taskType: 'customer_support',
        weight: 0.9,
        patterns: [
            /\b(support|help\sdesk|ticket|faq|troubleshoot|issue|problem|complaint|refund|cancel|return|account\s|password\sreset|how\sto\sfix)\b/i,
            /\b(customer\sservice|technical\ssupport|can\syou\shelp|I'm\shaving\s(an\s)?issue|my\saccount\s|not\sworking|error\smessage)\b/i
        ]
    },
    {
        taskType: 'image_analysis',
        weight: 1.0,
        patterns: [
            /\b(image\sanalysis|visual\s|extract\stext\sfrom|read\sthis\simage|what\sis\sin\sthis\spicture|identify\sthe\sobject|classify\sthis\simage)\b/i,
            /\b(analyze\sthe\s|describe\sthe\s|what\scan\syou\stell\s|does\sthis\simage\scontain|is\sthere\sa\s)\b.{0,3}(image|photo|picture|screenshot)\b/i
        ]
    },
    {
        taskType: 'document_processing',
        weight: 0.9,
        patterns: [
            /\b(document|pdf|word|excel|csv|parse|extract\sdata|convert\sfile|process\sdocument|invoice\sprocessing|form\s|resume|contract)\b/i,
            /\b(read\sthis\sfile|process\sthis\sdocument|extract\sinformation\sfrom|parse\sthis\s|csv\sfile|pdf\sfile)\b/i
        ]
    },
    {
        taskType: 'knowledge_search',
        weight: 0.8,
        patterns: [
            /\b(search|find|look\sup|retrieve|query|knowledge|database|rag|vector|embedding|semantic|similar|relevant|documentation)\b/i,
            /\b(what\sis\s|who\sis\s|where\sis\s|when\swas\s|tell\sme\sabout\s|I\swant\sto\sknow\s|do\syou\sknow)\b/i
        ]
    },
    {
        taskType: 'prompt_engineering',
        weight: 0.9,
        patterns: [
            /\b(prompt|prompt\sengineer|system\sprompt|few-shot|chain-of-thought|cot\s|instruction|template|role\s|persona|context|example)\b/i,
            /\b(optimize\sthis\sprompt|improve\sthe\sprompt|write\sa\sprompt\sfor|create\san?\sagent\s|better\sprompt)\b/i
        ]
    },
    {
        taskType: 'business_analysis',
        weight: 0.9,
        patterns: [
            /\b(business|ba\s|requirements|stakeholder|use\scase|user\sstory|acceptance\scriteria|bpmn|process\smap|gap\sanalysis|feasibility|swot|pestle|cost-benefit|rfi|rfp)\b/i,
            /\b(business\srequirements|functional\sspec|technical\sspec|process\sflow|business\scase|market\sresearch|competitive\sanalysis)\b/i
        ]
    }
];
export class TaskClassifier {
    cache = new Map();
    classify(prompt, context) {
        const combined = `${prompt} ${context ?? ''}`.toLowerCase();
        const hash = this.hashString(combined);
        const cached = this.cache.get(hash);
        if (cached) {
            return cached;
        }
        let bestMatch = null;
        for (const entry of CLASSIFY_PATTERNS) {
            let matchCount = 0;
            const matchedPatterns = [];
            for (const pattern of entry.patterns) {
                if (pattern.test(combined)) {
                    matchCount++;
                    matchedPatterns.push(pattern.source);
                }
            }
            if (matchCount > 0) {
                const score = (matchCount / entry.patterns.length) * entry.weight;
                if (!bestMatch || score > bestMatch.score) {
                    bestMatch = {
                        taskType: entry.taskType,
                        score,
                        reasoning: `Matched ${matchCount}/${entry.patterns.length} patterns for ${entry.taskType}`
                    };
                }
            }
        }
        if (!bestMatch) {
            bestMatch = {
                taskType: 'chat',
                score: 0.3,
                reasoning: 'No specific patterns matched, defaulting to chat'
            };
        }
        const result = {
            taskType: bestMatch.taskType,
            confidence: Math.min(bestMatch.score, 1.0),
            reasoning: bestMatch.reasoning
        };
        this.cache.set(hash, result);
        if (this.cache.size > 10000) {
            const keysToDelete = Array.from(this.cache.keys()).slice(0, 1000);
            for (const key of keysToDelete) {
                this.cache.delete(key);
            }
        }
        return result;
    }
    clearCache() {
        this.cache.clear();
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash.toString(36);
    }
}
