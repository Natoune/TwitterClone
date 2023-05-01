<script lang="ts">
    import { APP_NAME, MIN_AGE, RECAPTCHA_V2_KEY, RECAPTCHA_V3_KEY, RESOURCES } from "../utils/constants";
    import { emailExists, fakeUsername, register, registerCheck, usernameExists } from "../utils/auth";
    import { getTheme } from "../utils/theme";
    import TopLogo from "../components/TopLogo.svelte";

    let data = {
        name: '',
        email: '',
        day: '0',
        month: '0',
        year: '0',
        username: '',
        password: '',
        passwordConfirmation: '',
        recaptcha: '',
    };
    let step = 1;
    let errors = [];
    let formSubmitted = false;
    let btnDisabled = true;
    let invalidRecaptcha = false;
    let emailExistsError = false;
    let usernameExistsError = false;

    let winInnerWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        winInnerWidth = window.innerWidth;
    });

    const months = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
    ];
    const bissextile = (year: number) => {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    };
    const daysInMonth = (month: number, year: number) => {
        switch (month) {
            case 2:
                return bissextile(year) ? 29 : 28;
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
            default:
                return 31;
        }
    };

    async function validateStep(step: number) {
        switch (step) {
            case 1:
                return btnDisabled = (
                    data.name.length < 3 || data.name.length > 65 || !data.name.match(/^[a-zA-ZÀ-ÿ\- ]+$/) || data.name.split(' ').length < 2 ||
                    !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || (await emailExists(data.email))
                );
            case 2:
                return btnDisabled = (
                    data.day === '0' || data.month === '0' || data.year === '0'
                );
            case 3:
                return btnDisabled = (
                    data.username.length < 3 || data.username.length > 65 || !data.username.match(/^[a-zA-Z0-9\-_]+$/) || (await usernameExists(data.username)) ||
                    data.password.length < 8 || data.password.length > 255 || data.password !== data.passwordConfirmation
                );
            default:
                return btnDisabled = true;
        }
    }

    function next() {
        registerCheck(step, data).then(async () => {
            errors = [];
            step++;
            validateStep(step);
            if (step === 3) {
                data.username = await fakeUsername(data.name);
                usernameExistsError = false;
            }
            if (step >= 4) {
                step = 3;
                formSubmitted = true;

                let response = await register(data);
                if (response === 'ok') {
                    if (localStorage.getItem('redirect'))
                        window.location.href = localStorage.getItem('redirect');
                    else
                        window.location.href = "/";
                } else {
                    invalidRecaptcha = false;
                    if (response === 'invalid-recaptcha')
                        invalidRecaptcha = true;
                    else
                        errors = [ { message: 'Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.' } ]

                    formSubmitted = false;
                }
            }
        }).catch((response) => {
            if (Array.isArray(response))
                errors = response;
            else
                errors = [ { message: 'Une erreur est survenue lors de la vérification de vos données. Veuillez réessayer.' } ]
        });
    }

    function recaptchaSubmit() {
        // @ts-ignore
        grecaptcha.ready(function() {
            // @ts-ignore
            grecaptcha.execute(RECAPTCHA_V3_KEY, { action: "register" }).then((token: string) => {
                data.recaptcha = 'v3' + token;
                next();
            });
        });
    }
</script>

<svelte:head>
    <script type="text/javascript">
        var onloadCallback = function() {
            grecaptcha.render(document.getElementById('g-recaptcha'), {
                'sitekey': document.getElementById('g-recaptcha').dataset.sitekey,
                'callback': (token) => {
                    document.getElementById('recaptcha-v2-callback').dataset.token = 'v2' + token;
                    document.getElementById('recaptcha-v2-callback').click();
                },
                'placeholder': 'Recaptcha',
            });
        };
    </script>
    <script src="https://www.google.com/recaptcha/api.js?render={RECAPTCHA_V3_KEY}" async defer></script>
    <script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" async defer></script>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
    <div
        class="opacity-5 w-full h-full absolute top-0 left-0 bg-cover bg-no-repeat"
        style="background-image: url('{RESOURCES.LOGIN_BACKGROUNDS[Math.floor(Math.random() * RESOURCES.LOGIN_BACKGROUNDS.length)]}')"
    ></div>

    <TopLogo />
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="w-full lg:ml-10">
            <h1 class="text-5xl font-bold text-center">Rejoignez {APP_NAME}</h1>
            <p class="py-6 text-center">
                Inscription rapide et gratuite.
            </p>
        </div>
        <div class="card flex-shrink-0 w-full max-w-full sm:max-w-sm shadow-2xl bg-base-100 lg:mr-10">
            <div class="card-body">
                {#if invalidRecaptcha}
                    <h2 class="relative text-2xl font-bold w-full">
                        Vérification reCAPTCHA
                    </h2>
                    <p class="py-6">
                        Le système de vérification reCAPTCHA n'a pas pu valider votre requête.<br/>
                        Veuillez réessayer.
                    </p>
                    <button id="recaptcha-v2-callback" class="hidden" on:click={() => {
                        data.recaptcha = document.getElementById('recaptcha-v2-callback').dataset.token;
                        next();
                    }}></button>
                {:else}
                    {#if Object.values(errors).filter((error) => error.message.length > 0).length > 0}
                        <div class="alert alert-error shadow-lg">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span class="w-full">
                                <ul class="list-disc list-inside">
                                    {#each errors as error}
                                        {#if error.message.length > 0}
                                            <li>{error.message}</li>
                                        {/if}
                                    {/each}
                                </ul>
                            </span>
                        </div>
                    {/if}
                    {#if step === 1}
                        <h2 class="relative text-2xl font-bold w-full">
                            Informations générales
                        </h2>
                        <div class="form-control">
                            <label class="label" for="name">
                                <span class="label-text">Prénom et nom</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="John Doe"
                                maxlength="65"
                                autocomplete="off"
                                autocapitalize="words"
                                class="input input-bordered"
                                class:input-error={errors.find((error) => error.input === "name")}
                                bind:value={data.name}
                                on:change={async () => {
                                    // @ts-ignore
                                    let words = document.getElementById('name').value.split(' ');
                                    words.forEach((word) => {
                                        words[words.indexOf(word)] = word.charAt(0).toUpperCase() + word.slice(1);
                                    });
                                    // @ts-ignore
                                    document.getElementById('name').value = words.join(' ');
                                    data.name = words.join(' ');

                                    validateStep(1);
                                }}
                                on:keydown={async (e) => {
                                    if (e.key === 'Enter') {
                                        document.getElementById('email').focus();
                                    }

                                    validateStep(1);
                                }}
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="email">
                                <span class="label-text">Adresse email</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="john.doe@example.com"
                                maxlength="255"
                                autocomplete="off"
                                class="input input-bordered"
                                class:input-error={errors.find((error) => error.input === "email") || emailExistsError}
                                bind:value={data.email}
                                on:keydown={(e) => {
                                    if (e.key === 'Enter' && !btnDisabled) {
                                        document.getElementById('email').blur();
                                        next();
                                    }
                                }}
                                on:keyup={async () => {
                                    validateStep(1);
                                    if (data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                                        if (await emailExists(data.email)) {
                                            emailExistsError = true;
                                        } else {
                                            emailExistsError = false;
                                        }
                                    } else {
                                        emailExistsError = false;
                                    }
                                }}
                                on:change={async () => {
                                    validateStep(1);
                                    if (data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                                        if (await emailExists(data.email)) {
                                            emailExistsError = true;
                                        } else {
                                            emailExistsError = false;
                                        }
                                    } else {
                                        emailExistsError = false;
                                    }
                                }}
                            />
                            {#if emailExistsError}
                                <label class="label" for="email">
                                    <span class="text-error text-sm">
                                        Cette adresse email est déjà utilisée.
                                    </span>
                                </label>
                            {/if}
                        </div>
                    {:else if step === 2}
                        <h2 class="relative text-2xl font-bold w-11/12">
                            Date de naissance
                            {#if !formSubmitted}
                                <div class="absolute -top-4 -right-4 p-3">
                                    <button class="btn btn-ghost btn-circle" on:click={() => { step--; validateStep(step) }}>
                                        <i class="fas fa-arrow-left"></i>
                                    </button>
                                </div>
                            {/if}
                        </h2>
                        <div class="form-control">
                            <label class="label" for="day">
                                <span class="label-text">Jour</span>
                            </label>
                            <select
                                id="day"
                                class="select select-bordered w-full max-w-xs"
                                class:select-error={errors.find((error) => error.input === "day")}
                                bind:value={data.day}
                                on:change={() => {
                                    validateStep(2);
                                }}
                            >
                                <option value="0" selected disabled>Jour</option>
                                {#each Array.from(Array(daysInMonth(parseInt(data.month), parseInt(data.year))).keys()) as i}
                                    <option value={i + 1}>{i + 1}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label" for="month">
                                <span class="label-text">Mois</span>
                            </label>
                            <select
                                id="month"
                                class="select select-bordered w-full max-w-xs"
                                class:select-error={errors.find((error) => error.input === "month")}
                                bind:value={data.month}
                                on:change={() => {
                                    validateStep(2);
                                }}
                            >
                                <option value="0" selected disabled>Mois</option>
                                {#each Array.from(Array(12).keys()) as i}
                                    <option value={i + 1}>{months[i]}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label" for="year">
                                <span class="label-text">Année</span>
                            </label>
                            <select
                                id="year"
                                class="select select-bordered w-full max-w-xs"
                                class:select-error={errors.find((error) => error.input === "year")}
                                bind:value={data.year}
                                on:change={() => {
                                    validateStep(2);
                                }}
                            >
                                <option value="0" selected disabled>Année</option>
                                {#each Array.from(Array(100).keys()) as i}
                                    {#if parseInt(data.day) == 29 && parseInt(data.month) == 2 && !bissextile(new Date().getFullYear() - i - MIN_AGE)}
                                        <!--  -->
                                    {:else}
                                        <option value={new Date().getFullYear() - i - MIN_AGE}>{new Date().getFullYear() - i - MIN_AGE}</option>
                                    {/if}
                                {/each}
                            </select>
                        </div>
                    {:else if step === 3}
                        <h2 class="relative text-2xl font-bold w-11/12">
                            Dernière étape
                            {#if !formSubmitted}
                                <div class="absolute -top-4 -right-4 p-3">
                                    <button class="btn btn-ghost btn-circle" on:click={() => { step--; validateStep(step) }}>
                                        <i class="fas fa-arrow-left"></i>
                                    </button>
                                </div>
                            {/if}
                        </h2>
                        <div class="form-control">
                            <label class="label" for="username">
                                <span class="label-text">Nom d'utilisateur</span>
                            </label>
                            <label class="input-group" for="username">
                                <span>
                                    @
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="johndoe"
                                    maxlength="32"
                                    autocomplete="off"
                                    class="input input-bordered w-full"
                                    class:input-error={errors.find((error) => error.input === "username") || usernameExistsError}
                                    disabled={formSubmitted}
                                    bind:value={data.username}
                                    on:keydown={(e) => {
                                        if (e.key === 'Enter' && !btnDisabled) {
                                            document.getElementById("password").focus();
                                        }
                                    }}
                                    on:keyup={async () => {
                                        validateStep(3);
                                        if (data.username.length > 4) {
                                            if (await usernameExists(data.username)) {
                                                usernameExistsError = true;
                                            } else {
                                                usernameExistsError = false;
                                            }
                                        } else {
                                            usernameExistsError = false;
                                        }
                                    }}
                                    on:change={async () => {
                                        validateStep(3);
                                        if (data.username.length > 4) {
                                            if (await usernameExists(data.username)) {
                                                usernameExistsError = true;
                                            } else {
                                                usernameExistsError = false;
                                            }
                                        } else {
                                            usernameExistsError = false;
                                        }
                                    }}
                                />
                            </label>
                            {#if usernameExistsError}
                                <label class="label" for="email">
                                    <span class="text-error text-sm">
                                        Ce nom d'utilisateur est déjà utilisé.
                                    </span>
                                </label>
                            {/if}
                        </div>
                        <div class="form-control">
                            <label class="label" for="password">
                                <span class="label-text">Mot de passe</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                maxlength="255"
                                class="input input-bordered"
                                class:input-error={errors.find((error) => error.input === "password")}
                                disabled={formSubmitted}
                                bind:value={data.password}
                                on:keydown={(e) => {
                                    if (e.key === 'Enter' && !btnDisabled) {
                                        document.getElementById("passwordConfirmation").focus();
                                    }
                                }}
                                on:keyup={() => {
                                    validateStep(3);
                                }}
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="password_confirm">
                                <span class="label-text">Répéter le mot de passe</span>
                            </label>
                            <input
                                type="password"
                                id="passwordConfirmation"
                                placeholder="••••••••"
                                maxlength="255"
                                class="input input-bordered"
                                class:input-error={errors.find((error) => error.input === "passwordConfirmation")}
                                disabled={formSubmitted}
                                bind:value={data.passwordConfirmation}
                                on:keydown={(e) => {
                                    if (e.key === 'Enter' && !btnDisabled && !formSubmitted) {
                                        next();
                                    }
                                }}
                                on:keyup={() => {
                                    validateStep(3);
                                }}
                            />
                        </div>
                    {/if}
                    <div class="form-control mt-6">
                        <button
                            class="btn btn-primary"
                            disabled={formSubmitted || btnDisabled}
                            on:click={async () => {
                                if (await validateStep(step)) {
                                    btnDisabled = true;
                                    return;
                                }

                                if (step === 3) {
                                    recaptchaSubmit();
                                } else {
                                    next();
                                }
                            }}
                        >
                            {step === 3 ? "Créer un compte" : "Suivant"}
                        </button>
                    </div>
                    <p class="py-2 text-center">
                        Vous avez déjà un compte ? <a href="/login" class="link link-primary">Connectez-vous</a>
                    </p>
                {/if}
                <div
                    id="g-recaptcha"
                    class="mx-auto"
                    class:hidden={!invalidRecaptcha}
                    data-sitekey="{RECAPTCHA_V2_KEY}"
                    data-size="{winInnerWidth < 768 ? "compact" : "normal"}"
                    data-theme="{getTheme() === "cdark" ? "dark" : "light"}"
                ></div>
            </div>
        </div>
    </div>
</div>
