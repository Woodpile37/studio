import dedent from 'dedent';
import { zipObject } from 'lodash';

import { AppAction, AppDefinitionObject, AppTag, GroupType } from '../../src/app/app.interface';
import { Network } from '../../src/types/network.interface';
import { strings } from '../strings';

import { formatAndWrite } from './utils';

export async function generateAppDefinition(appDefinition: Partial<AppDefinitionObject>) {
  const appDefinitionName = `${strings.upperCase(appDefinition.id)}_DEFINITION`;
  const appClassName = strings.titleCase(appDefinition.id);

  const networkToKey = zipObject(Object.values(Network), Object.keys(Network));
  const tagToKey = zipObject(Object.values(AppTag), Object.keys(AppTag));
  const actionToKey = zipObject(Object.values(AppAction), Object.keys(AppAction));
  const gtToKey = zipObject(Object.values(GroupType), Object.keys(GroupType));

  const content = dedent`
    import { Register } from '~app-toolkit/decorators';
    import { appDefinition, AppDefinition } from '~app/app.definition';
    import { GroupType, AppAction, AppTag } from '~app/app.interface';
    import { Network } from '~types/network.interface';

    export const ${appDefinitionName} = appDefinition({
      id: '${appDefinition.id}',
      name: '${appDefinition.name}',
      description: '${appDefinition.description}',
      url: '${appDefinition.url}',
      groups: {${Object.entries(appDefinition.groups)
        .map(([gk, g]) => `${gk}: { id: '${g.id}', type: GroupType.${gtToKey[g.type]}, label: '${g.label}' }`)
        .join(',')}},
      tags: [${appDefinition.tags.map(n => `AppTag.${tagToKey[n]}`).join(',')}],
      keywords: ${JSON.stringify(appDefinition.keywords ?? [])},
      links: ${JSON.stringify(appDefinition.links)},
      supportedNetworks: {
        ${Object.entries(appDefinition.supportedNetworks)
          .map(([nk, n]) => `[Network.${networkToKey[nk]}]: [${n.map(v => `AppAction.${actionToKey[v]}`).join(',')}]`)
          .join(',')}
      },
      primaryColor: '${appDefinition.primaryColor ?? '#fff'}',
    });

    @Register.AppDefinition(${appDefinitionName}.id)
    export class ${appClassName}AppDefinition extends AppDefinition {
      constructor() {
        super(${appDefinitionName});
      }
    }

    export default ${appDefinitionName};
  `;

  await formatAndWrite(`./src/apps/${appDefinition.id}/${appDefinition.id}.definition.ts`, content);
}
