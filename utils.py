import openai
import re
from string import punctuation


def openai_query(max_tries, messages, stop=None, max_tokens=None, temperature=None):
    """Query OpenAI API for a response.

    Args:
        max_tries (int): Maximum number of tries to get a response from OpenAI.
        messages (list): List of messages to send to OpenAI.
        stop (str): String to stop the response.
        max_tokens (int): Maximum number of tokens to return.
        temperature (float): Temperature of the response.

    Returns:
        response (dict): Response from OpenAI.
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        stop=stop,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return response


def get_initial_ideas(openai_key, max_tries, age, gender, idea, trend, industry):
    """Function to get initial ideas from openai
    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        age (str): age
        gender (str): gender
        idea (str): idea type
        trend (str): trend
        industry (str): industry
     Returns:
        output_list (list): list of ideas
    """
    openai.api_key = openai_key

    target_gender = gender
    target_age = age
    industry = industry
    meta_trend = trend
    idea_type = idea

    if not meta_trend:
        meta_trend = "Space Exploration"

    print("Hitting openai ... ")

    prompt = f"Descriptions of {idea_type}s should be approximately 40 words long.\nIdeas for {idea_type}s will be in the following format only:\n\n1. Idea Name: Description of Idea\n2. Idea Name: Description of Idea\n3. Idea Name: Description of Idea\n4. Idea Name: Description of Idea\n5. Idea Name: Description of Idea\n6. Idea Name: Description of Idea\nEND\n\n"
    if industry:
        prompt += f"Industry: {industry}\n"
    if target_gender:
        prompt += f"Target gender: {target_gender}\n"
    if target_age:
        prompt += f"Target age: {target_age}\n"
    prompt += f"Theme: {meta_trend}\n\nWhat are some ideas for {idea_type}s based on the given "
    if industry:
        prompt += "industry,"
    if target_gender:
        prompt += "target gender,"
    if target_age:
        prompt += "target age,"
    if (industry != "") | (target_age != "") | (target_gender != ""):
        prompt += "and theme?"
    else:
        prompt += "theme?"

    messages = [
        {"role": "system", "content": f"You are a {idea_type} expert."},
        {"role": "user", "content": prompt},
    ]
    stop = ["\nEND", "END"]

    response = openai_query(max_tries, messages, stop=stop, max_tokens=300)

    response_text = response["choices"][0]["message"]["content"]

    response_bullets = response_text.split("\n")
    summary_text = [re.sub("\d.", "", i).strip() for i in response_bullets]
    results_list = [i.split(": ") for i in summary_text]
    results_list = [i for i in results_list if i != [""]]

    final_results = []
    for i in results_list:
        if i not in ["", ["END"]]:
            final_results.append([i[0].strip(punctuation), i[1].strip(punctuation)])

    return final_results


def get_price_point(openai_key, max_tries, title, description):
    """Function to get price point from openai
    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
    Returns:
        response_text (str): price point
    """
    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Suggested price response will only be in the form of:'£x-£y END'\n\nProduct Idea: {title}\nProduct Description: {description}\nWhat is a good suggested price point?"

    messages = [
        {"role": "system", "content": "You are a product expert."},
        {"role": "user", "content": prompt},
    ]
    stop = ["\nEND", "END"]

    response = openai_query(max_tries, messages, stop)

    response_text = response["choices"][0]["message"]["content"]
    response_text = response_text.replace("END", "")

    return response_text


def get_product_details(openai_key, max_tries, title, description):
    """Function to get product details from openai
    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description

    Returns:
        summary_text (list): list of product details
    """
    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Product detials will only be in the form:\n- product detail\n\nProduct details will not repeat the product name or description.\n\nProduct Idea: {title}\nProduct Description: {description}\n\nWhat are details of the above product in at least 5 bullet points?"

    messages = [
        {"role": "system", "content": "You are a product expert."},
        {"role": "user", "content": prompt},
    ]
    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_tag_lines(openai_key, max_tries, title, description):
    """Function to get tag lines from openai
    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description

    Returns:
        summary_text (list): list of tag lines
    """
    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Tag Lines bullet points will not begin with numbers and will only be in the form:\n- tag line\n\nProduct Idea: {title}\nProduct Description: {description}.\n\nFive tag lines are:"

    messages = [
        {"role": "system", "content": "You are a product expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [re.sub("\d", "", i).replace(".", "").strip() for i in summary_text]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_roadmap(openai_key, max_tries, title, description):
    """Function to get product road map from openai
    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description

    Returns:
        summary_text (list): list of product road map
    """
    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Product road map will be in this form only:\n- 'development step name' (time taken in weeks or months): details about development step\n\nProduct {title}\nProduct Description: {description}\n\nProduct road map:"

    messages = [
        {"role": "system", "content": "You are a product expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = []
    for i in response_bullets:
        i = re.sub("- ", "", i).strip()
        if (":" in i) & (i != ""):
            summary_text.append(i)

    return summary_text


def get_execution(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get campaign execution steps from openai

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        response_text (str): campaign execution steps
    """

    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Campaign: {title}\nCampaign Description: {description}\nIndustry: {industry}\nCampaign Theme: {trend}\nTarget Age: {age}\nTarget Gender: {gender}\n\nSteps for executing this campaign:"

    messages = [
        {"role": "system", "content": "You are a marketing campaign expert."},
        {
            "role": "user",
            "content": "Campaign execution steps will be in this format only:\n- execution step (time taken in weeks or months):details about execution step\n\nDetails about the execution should be in a single line with no newlines.\n\nWhen I ask for campaign execution steps I want this format only with no preceeding text.\n\nDo you understand?",
        },
        {
            "role": "assistant",
            "content": "Yes, I understand. I can provide you with a list of campaign execution steps in the format you have mentioned. Please let me know what type of campaign you are planning to execute and what your goals are so that I can tailor the steps accordingly.",
        },
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_campaign_tag_lines(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get campaign tag lines from openai

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        summary_text (list): campaign tag lines
    """

    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Campaign tag lines will be in this form only:\n- tag line\n\nCampaign: {title}\nCampaign Description: {description}\nIndustry: {industry}\nCampaign Theme: {trend}\nTarget Age: {age}\nTarget Gender: {gender}\n\nWhat are some great campaign tag lines?"

    messages = [
        {"role": "system", "content": "You are a marketing campaign expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [re.sub("\d", "", i).replace(".", "").strip() for i in summary_text]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_tone(openai_key, max_tries, title, description, age, gender, industry, trend):
    """Get tone of voice for a campaign.

    Args:
      openai_key: OpenAI API key.
      max_tries: Maximum number of tries to get a response from OpenAI.
      title: Title of the campaign.
      description: Description of the campaign.
      age: Target age group for the campaign.
      gender: Target gender for the campaign
      industry: Industry for the campaign.
      trend: Trend for the campaign.

    Returns:
      A string containing the tone of voice for the campaign.
    """
    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Tone of voice descriptions should articulate the manner in which the campaign should address customers and explain why this manner is appropriate. Descriptions should finish with the string 'END'\n\nCampaign: {title}\nCampaign Description: {description}\nIndustry: {industry}\nCampaign Theme: {trend}\nTarget Age: {age}\nTarget Gender: {gender}\n\nTone of voice for the campaign:"

    messages = [
        {"role": "system", "content": "You are a marketing campaign expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]

    summary_text = re.sub("\n", "", response_text).replace("END", "").strip()

    return summary_text


def get_brand_partners(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get potential brand partners for a campaign.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        summary_text (list): potential brand partners"""

    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Potenial brand partners should be in this form only: - partner name (partner website url)\n\nCampaign: {title}\nCampaign Description: {description}\nIndustry: {industry}\nCampaign Theme: {trend}\nTarget Age: {age}\nTarget Gender: {gender}\n\nPotential Brand Parters in the United Kingdom for the campaign theme:"

    messages = [
        {"role": "system", "content": "You are a marketing campaign expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [re.sub("\d", "", i).strip() for i in summary_text]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_platforms(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get platforms for campaign delivery.

    Args:
        openai_key: OpenAI API key.
        max_tries: Maximum number of tries to get a response from OpenAI.
        title: Title of the campaign.
        description: Description of the campaign.
        age: Target age group for the campaign.
        gender: Target gender for the campaign
        industry: Industry for the campaign.
        trend: Trend for the campaign.

    Returns:
        A list of strings containing the platforms for campaign delivery.
    """

    openai.api_key = openai_key

    print("Hitting openai ... ")

    prompt = f"Platforms for campaign delivery should be relevant to the target age and gender.\nPlatforms for campaign delivery should only be in the form: - platform name: description of how to utilise the platform\n\nCampaign: {title}\nCampaign Description: {description}\nIndustry: {industry}\nCampaign Theme: {trend}\nTarget Age: {age}\nTarget Gender: {gender}\n\nPlatforms for campaign delivery:\n-"

    messages = [
        {"role": "system", "content": "You are a marketing campaign expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    response_bullets = [i for i in response_bullets if i.strip() != ""]

    summary_text = [re.sub("- ", "", i).split(": ") for i in response_bullets]
    summary_text = [[i[0].strip(), i[1].strip()] for i in summary_text]

    return summary_text


def get_retailers(openai_key, max_tries, title, description):
    """Get potential retailers for a product.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description

    Returns:
        summary_text (list): potential retailers
    """

    openai.api_key = openai_key

    prompt = f"Potenial retailors that could stock my product should be in this form only: - retailor (retailor website url)\n\nProduct: {title}\nProduct Description: {description}\n\nPotential Retailors in the United Kingdom for the product:"

    messages = [
        {"role": "system", "content": "You are a product expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [re.sub(r"\d+\.", "", i).strip() for i in summary_text]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_chat_response(openai_key, max_tries, messages, roles, context, idea_type):
    """Get chat response from OpenAI.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        messages (list): list of messages
        roles (list): list of roles
        context (dict): context
        idea_type (str): idea type

    Returns:
        response_text: OpenAI response text
    """

    openai.api_key = openai_key

    initial_prompt = ""

    for k, v in context.items():
        if type(v) == list:
            if (v != []) and (type(v[0]) != list):
                a = "\n".join(v)
                initial_prompt += f"{k}:{a}\n"
        else:
            initial_prompt += f"{k}:{v}\n"
    initial_prompt += f"I'm going to ask you some questions about the {idea_type}, and I want you to respond using the above information as a basis for your answers. Do you understand?"

    message_prompt = [
        {"role": "system", "content": f"You are a {idea_type} expert."},
        {"role": "user", "content": initial_prompt},
        {"role": "assistant", "content": "Yes, I understand. Let's get started!"},
    ]

    for i in range(1, len(messages)):
        role_string = roles[i]
        if "response-message" in role_string:
            role = "assistant"
        elif "user-message" in role_string:
            role = "user"
        d = {"role": role, "content": messages[i]}
        message_prompt.append(d)

    response = openai_query(max_tries, message_prompt)
    response_text = response["choices"][0]["message"]["content"]

    return response_text


def get_vision(openai_key, max_tries, title, description, age, gender, industry, trend):
    """Get vision for a strategy.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        summary_text: vision summary text
    """

    openai.api_key = openai_key

    prompt = f"Strategy title: {title}\nStrategy description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWhat would be the overall vision for this strategy? Please answer in bullet point form where bullets are of form ' -'"

    messages = [
        {"role": "system", "content": "You are a business strategy expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_customer_value(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get customer value for a strategy.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        summary_text: customer value summary text
    """

    openai.api_key = openai_key

    prompt = f"Strategy title: {title}\nStrategy description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWhat value would this strategy bring to our customers? Please answer in bullet point form where bullets are of form ' -'"

    # What resources/capabilities will we need to execute this strategy

    messages = [
        {"role": "system", "content": "You are a business strategy expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_resources_capabilities(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get resources and capabilities for a strategy.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        summary_text: resources and capabilities summary text
    """

    openai.api_key = openai_key

    prompt = f"Strategy title: {title}\nStrategy description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWhat resources or capabilities would we need to execute this strategy? Please answer in bullet point form where bullets are of form ' -'"

    messages = [
        {"role": "system", "content": "You are a business strategy expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_objectives(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get objectives for a strategy.

    Args:
        openai_key (str): openai key
        max_tries (int): max number of tries
        title (str): title
        description (str): description
        age (str): age
        gender (str): gender
        industry (str): industry
        trend (str): trend

    Returns:
        summary_text: objectives summary text
    """

    openai.api_key = openai_key

    prompt = f"Strategy title: {title}\nStrategy description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWhat are some measurable objectives for this strategy? Please answer in bullet point form where bullets are of form ' -'"

    messages = [
        {"role": "system", "content": "You are a business strategy expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_value_proposition(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get value proposition for a business model

    Args:
        openai_key (str): OpenAI API key
        max_tries (int): Maximum number of tries to query OpenAI API
        title (str): Business model title
        description (str): Business model description
        age (str): Target Age of the business model
        gender (str): Target Gender of the business model
        industry (str): Target Industry of the business model
        trend (str): Target Trend of the business model

    Returns:
        summary_text: value proposition summary text
    """

    openai.api_key = openai_key

    prompt = f"Business Model Title: {title}\nBusiness Model Description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWhat novel value proposition should we adopt based on this business model? This should be as radically different as possible from existing value propositions as possible. Please answer in bullet point form where bullets are of the form ' -'."

    messages = [
        {"role": "system", "content": "You are a business model expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_revenue_model(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get a novel revenue model based on a business model description

    Args:
        openai_key (str): OpenAI API key
        max_tries (int): Number of tries to get a response from OpenAI
        title (str): Title of the business model
        description (str): Description of the business model
        age (str): Target Age of the business model
        gender (str): Target gender of the business model
        industry (str): Target Industry of the business model
        trend (str): Target Trend of the business model

    Returns:
        list: List of novel revenue models
    """
    openai.api_key = openai_key

    prompt = f"Business Model Title: {title}\nBusiness Model Description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nwhat new and innovative revenue models could we adopt to generate revenue from this business model? Please answer in bullet point form where bullets are of the form ' -'."

    messages = [
        {"role": "system", "content": "You are a business model expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]
    response_bullets = response_text.split("\n")
    summary_text = [re.sub("- ", "", i).strip() for i in response_bullets]
    summary_text = [i for i in summary_text if i != ""]

    return summary_text


def get_competitors(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get competitors and competitive advantage from a business model description

    Args:
        openai_key (str): OpenAI API key
        max_tries (int): Maximum number of tries to query OpenAI API
        title (str): Business model title
        description (str): Business model description
        age (str): Target Age of business model
        gender (str): Target Gender of business model
        industry (str): Target Industry of business model
        trend (str): Target Trend of business model

    Returns:
        summary_text (list): List of competitors and competitive advantage"""

    openai.api_key = openai_key

    prompt = f"Business Model Title: {title}\nBusiness Model Description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWho will be our top 5 competitors in the United Kingdom? For each competitor please explain what our competitive advantage would be. Answers should only be in this form only with no other text:\n\n'Competitor name': 'description of competitive advantage'"

    messages = [
        {"role": "system", "content": "You are a business model expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]

    response_bullets = response_text.split("\n")
    summary_text = [i.split(": ") for i in response_bullets]
    summary_text = [i for i in summary_text if i != [""]]
    summary_text = [
        [re.sub(r"\d+\.", "", i[0]).strip(), i[1].strip()] for i in summary_text
    ]

    return summary_text


def get_target_demographic(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get target demographic for a business model.

    Args:
        openai_key (str): OpenAI API key
        max_tries (int): Maximum number of tries to get a response from OpenAI
        title (str): Title of the business model
        description (str): Description of the business model
        age (str): Age of the target demographic
        gender (str): gender of the target demographic
        industry (str): Industry of the business model
        trend (str): Trend of the business model

    Returns:
        list: List of target demographic information
    """
    openai.api_key = openai_key

    prompt = f"Business Model Title: {title}\nBusiness Model Description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nwhat would be the target market for this business model in terms of demographic information?\n\nResponse should be in the form of:\n\nGender:\nAge range:\nEducation:\nSocio-Economic status:"

    messages = [
        {"role": "system", "content": "You are a business model expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]

    response_bullets = response_text.split("\n")
    summary_text = [i.split(": ") for i in response_bullets]
    summary_text = [i for i in summary_text if i != [""]]
    summary_text = [i[0].strip() + ": " + i[1].strip() for i in summary_text]

    return summary_text


def get_target_market_size(
    openai_key, max_tries, title, description, age, gender, industry, trend
):
    """Get target market size for a business model.

    Args:
        openai_key (str): OpenAI API key
        max_tries (int): Maximum number of tries to get a response from OpenAI
        title (str): Title of the business model
        description (str): Description of the business model
        age (str): Age of the target demographic
        gender (str)): Gender of the target demographic
        industry (str): Industry of the business model
        trend (str): Trend of the business model

    Returns:
        list: List of target market size information
    """
    openai.api_key = openai_key

    prompt = f"Business Model Title: {title}\nBusiness Model Description {description}\nIndustry:{industry}\nStrategy Theme:{trend}\nWhat is the approximate size of the target market for this business in the United Kingdom? \n\nResponse should be in the form of:\n\napproximate market size:\nmarket growth statistics:"

    messages = [
        {"role": "system", "content": "You are a business model expert."},
        {"role": "user", "content": prompt},
    ]

    response = openai_query(max_tries, messages)

    response_text = response["choices"][0]["message"]["content"]

    response_bullets = response_text.split("\n")
    response_bullets = [
        i
        for i in response_bullets
        if (
            i.startswith("approximate market size:")
            | i.startswith("market growth statistics:")
        )
    ]

    return response_bullets
